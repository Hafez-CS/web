from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from chat_assistant.models import Chat, ChatRoom
from .ai_client import send_exam_to_ai
from .data import EXAMS

def get_exam_by_slug(slug):
    for exam in EXAMS:
        if exam["slug"] == slug:
            return exam
    return None

class StartExamView(APIView):
    permission_classes = [IsAuthenticated]

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
            if qid in answers and answers[qid] == q["answer"]:
                score += 1
        
        result, created = Exam.objects.update_or_create(
            user=request.user,
            slug=exam["slug"],
            defaults={"title": exam["title"], "score": score},
        )

        chat, _ = Chat.objects.get_or_create(user=request.user)
        room = ChatRoom.objects.create(
            user=request.user,
            chat=chat,
            name=f"دستیار برای آزمون {exam["title"]}"
        )

        return Response({
            "title": exam["title"],
            "slug": exam["slug"],
            "score": score,
            "total": len(exam["questions"]),
            "chatroom_slug": room.slug
        })