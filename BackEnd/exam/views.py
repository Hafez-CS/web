from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from .serializers import ExamSerializer
from chat_assistant.models import Chat, ChatRoom
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
import uuid
from .ai_client import send_exam_to_ai

class ExamView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSerializer

    def get(self, request, slug, *args, **kwargs):
        exam_template = get_object_or_404(Exam, slug=slug, user__isnull=True)
        return Response({
            "title": exam_template.title,
            "questions": exam_template.questions
        }, status=status.HTTP_200_OK)

    def post(self, request, slug, *args, **kwargs):
        exam_template = get_object_or_404(Exam, slug=slug, user__isnull=True)
        user_answers = request.data.get("answers", {})
        score = 0
        for q in exam_template.questions:
            if str(q["id"]) in user_answers and user_answers[str(q["id"])] == q["correct_answer"]:
                score += 1

        exam = Exam.objects.create(
            title=exam_template.title,
            questions=exam_template.questions,
            user=request.user,
            answers=user_answers,
            score=score
        )

        payload = {
            "user": request.user.email,
            "exam_id": exam.id,
            "title": exam.title,
            "answers": user_answers,
            "score": score
        }

        ai_response = send_exam_to_ai(payload)
        ai_message = ai_response.get("feedback", "نتایج آزمون آماده است")

        chat, _ = Chat.objects.get_or_create(user=request.user)
        room = ChatRoom.objects.create(user=request.user, chat=chat, name=f"کمک برای آزمون {exam.title}")

        ai_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "bot",
            "message": f"سلام! امتیازت {score} از {len(exam_template.questions)} تو آزمون '{exam.title}' بود. می‌خوای برات تحلیل آزمون انجام بدم؟",
            "timestamp": timezone.now().isoformat()
        }

        with transaction.atomic():
            chat = Chat.objects.select_for_update().get(pk=chat.pk)
            if not isinstance(chat.content, list):
                chat.content = []
            chat.content.append(ai_msg)
            chat.save(update_fields=["content", "updated_at"])

        response_data = ExamSerializer(exam).data
        response_data['chat_room_slug'] = room.slug
        response_data['ai_feedback'] = ai_message
        return Response(response_data, status=status.HTTP_201_CREATED)