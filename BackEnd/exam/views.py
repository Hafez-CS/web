from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from .serializers import ExamSerializer
from chat_assistant.models import Chat, ChatRoom
from .ai_client import send_exam_to_ai

QUESTIONS = [
    {"id": 1, "question": "2 + 2 ?", "options": ["3", "4", "5","6"], "answer": "4"},
    {"id": 2, "question": "پایتخت ایران کدام شهر است ؟", "options": ["تهران", "کرج", "تبریز","مشهد"], "answer": "تهران"}
]

class ExamStartView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({
            "title": "آزمون تست",
            "questions": QUESTIONS
        }, status=status.HTTP_200_OK)

class ExamSubmitView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamSerializer

    def post(self, request, *args, **kwargs):
        user_answers = request.data.get("answers", {})
        score = 0
        for q in QUESTIONS:
            if str(q["id"]) in user_answers and user_answers[str(q["id"])] == q["answer"]:
                score += 1
        
        exam = Exam.objects.create(
            title="آزمون تست",
            user=request.user,
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

        chat, created = Chat.objects.get_or_create(user=request.user)

        room_name = f"گفتگو درباره آزمون : {exam.title}"
        chatroom = ChatRoom.objects.create(
            user=request.user,
            chat=chat,
            name=room_name
        )

        message = {
            "room": chatroom.slug,
            "sender": "bot",
            "content": ai_message,
            "exam_id": exam.id
        }

        chat.content.append(message)
        chat.save()

        return Response({
            "exam": ExamSerializer(exam).data,
            "ai_feedback": ai_response,
            "chatroom": {
                "id": chatroom.id,
                "slug": chatroom.slug,
                "name": chatroom.name
            }
        }, status=status.HTTP_201_CREATED)
