from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from chat_assistant.models import Chat, ChatRoom
from .ai_client import send_exam_to_ai
from .data import EXAMS
from django.db import transaction
import uuid
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter

def get_exam_by_slug(slug):
    for exam in EXAMS:
        if exam["slug"] == slug:
            return exam
    return None

class StartExamView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='slug',
                type=str,
                location=OpenApiParameter.PATH,
                description='شناسه منحصربه‌فرد آزمون (مثل python-basics)',
                required=True
            )
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string', 'description': 'عنوان آزمون'},
                    'slug': {'type': 'string', 'description': 'شناسه آزمون'},
                    'questions': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer', 'description': 'شناسه سوال'},
                                'text': {'type': 'string', 'description': 'متن سوال'},
                                'options': {
                                    'type': 'array',
                                    'items': {'type': 'string'},
                                    'description': 'گزینه‌های سوال'
                                }
                            }
                        },
                        'description': 'لیست سوالات آزمون'
                    }
                }
            },
            404: {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string', 'description': 'پیام خطا'}
                }
            }
        },
        tags = ["Exam_module"],
        summary="شروع آزمون",
        description="دریافت اطلاعات آزمون شامل عنوان، اسلاگ و سوالات (بدون پاسخ درست) برای شروع آزمون."
    )
    def get(self, request, slug):
        exam = get_exam_by_slug(slug=slug)
        if not exam:
            return Response({
                "error": "Exam not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        questions = [
            {"id": q["id"], "text": q["text"], "options": q["options"]} for q in exam["questions"]
        ]
        return Response({
            "title": exam["title"],
            "slug": exam["slug"],
            "questions": questions
        })
    
class SubmitExamView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='slug',
                type=str,
                location=OpenApiParameter.PATH,
                description='شناسه منحصربه‌فرد آزمون (مثل python-basics)',
                required=True
            )
        ],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'answers': {
                        'type': 'object',
                        'additionalProperties': {'type': 'string'},
                        'description': 'دیکشنری پاسخ‌های کاربر با کلید شناسه سوال و مقدار پاسخ انتخاب‌شده'
                    }
                },
                'required': ['answers']
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string', 'description': 'عنوان آزمون'},
                    'slug': {'type': 'string', 'description': 'شناسه آزمون'},
                    'score': {'type': 'integer', 'description': 'امتیاز کاربر'},
                    'total': {'type': 'integer', 'description': 'تعداد کل سوالات'},
                    'chatroom_slug': {'type': 'string', 'description': 'شناسه اتاق چت برای تحلیل نتایج'},
                    'ai_feedback': {'type': 'string', 'description': 'فیدبک تولیدشده توسط AI'}
                }
            },
            404: {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string', 'description': 'پیام خطا'}
                }
            }
        },
        tags = ["Exam_module"],
        summary="ارسال پاسخ‌های آزمون",
        description="دریافت پاسخ‌های کاربر، محاسبه امتیاز، ذخیره نتیجه، ایجاد اتاق چت برای تحلیل، و بازگشت فیدبک AI."
    )
    def post(self, request, slug):
        exam = get_exam_by_slug(slug=slug)
        if not exam:
            return Response({
                "error": "Exam not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        answers = request.data.get("answers", {})
        score = 0

        for q in exam["questions"]:
            qid = str(q["id"])
            if qid in answers and answers[qid] == q["options"][q["answer"]]:
                score += 1
        
        result, created = Exam.objects.update_or_create(
            user=request.user,
            slug=slug,
            defaults={"title": exam["title"], "score": score},
        )

        payload = {
            "user": request.user.email,
            "slug": slug,
            "title": exam["title"],
            "score": score
        }
        ai_response = send_exam_to_ai(payload)
        ai_message = ai_response.get("feedback", "نتایج آزمون آماده است")

        chat, _ = Chat.objects.get_or_create(user=request.user)
        room = ChatRoom.objects.create(
            user=request.user,
            chat=chat,
            name=f"دستیار برای آزمون {exam['title']}"
        )

        ai_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "bot",
            "message": ai_message,
            "timestamp": timezone.now().isoformat()
        }

        with transaction.atomic():
            chat = Chat.objects.select_for_update().get(pk=chat.pk)
            if not isinstance(chat.content, list):
                chat.content = []
            chat.content.append(ai_msg)
            chat.save(update_fields=["content", "updated_at"])

        return Response({
            "title": exam["title"],
            "slug": exam["slug"],
            "score": score,
            "total": len(exam["questions"]),
            "chatroom_slug": room.slug,
            "ai_feedback": ai_message
        })
    
class ListExamsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'title': {'type': 'string', 'description': 'عنوان آزمون'},
                        'slug': {'type': 'string', 'description': 'شناسه آزمون'}
                    }
                },
                'description': 'لیست تمام آزمون‌های موجود'
            }
        },
        tags=["Exam_module"],
        summary="لیست همه آزمون‌ها",
        description="این API لیست تمام آزمون‌های موجود (عنوان و اسلاگ) را برمی‌گرداند."
    )
    def get(self, request):
        exams = [{"title": e["title"], "slug": e["slug"]} for e in EXAMS]
        return Response(exams, status=status.HTTP_200_OK)
