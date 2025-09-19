# exam/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from .serializers import ExamSerializer
from chat_assistant.models import Chat, ChatRoom
from django.utils import timezone
import uuid
from .ai_client import send_exam_to_ai

print("Loading exam/views.py") 

QUESTIONS = [
    {
        "id": 1,
        "question_text": "بزرگ‌ترین سیاره چیست؟",
        "options": {"A": "مشتری", "B": "زحل", "C": "زمین", "D": "مریخ"},
        "correct_answer": "A"
    },
    {
        "id": 2,
        "question_text": "ماه چند روزه دور زمین می‌چرخه؟",
        "options": {"A": "14 روز", "B": "28 روز", "C": "30 روز", "D": "365 روز"},
        "correct_answer": "B"
    }
]

class ExamView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSerializer

    def get(self, request, title, *args, **kwargs):
        print(f"ExamView GET called with title: {title}")
        return Response({
            "title": title,
            "questions": QUESTIONS
        }, status=status.HTTP_200_OK)

    def post(self, request, title, *args, **kwargs):
        print(f"ExamView POST called with title: {title}")
        user_answers = request.data.get("answers", {})
        score = 0
        for q in QUESTIONS:
            if str(q["id"]) in user_answers and user_answers[str(q["id"])] == q["correct_answer"]:
                score += 1
        
        # if Exam.objects.filter(user=request.user, title=title).exists():
        #     return Response({
        #         "success": False,
        #         "detail": "شما قبلاً در این آزمون شرکت کرده‌اید."
        #     }, status=status.HTTP_400_BAD_REQUEST)

        exam = Exam.objects.create(
            user=request.user,
            title=title,
            score=score,
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
        room = ChatRoom.objects.create(user=request.user, chat=chat, name=f"کمک برای آزمون {title}")

        ai_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "bot",
            "message": f"سلام! امتیازت {score} از {len(QUESTIONS)} تو آزمون '{title}' بود. می‌خوای برات تحلیل آزمون انجام بدم؟",
            "timestamp": timezone.now().isoformat()
        }

        if not isinstance(chat.content, list):
            chat.content = []
        chat.content.append(ai_msg)
        chat.save()

        response_data = ExamSerializer(exam).data
        response_data['chat_room_slug'] = room.slug
        response_data['ai_feedback'] = ai_message
        return Response(response_data, status=status.HTTP_201_CREATED)