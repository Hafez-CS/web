from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from .serializers import ExamSerializer

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

        return Response(ExamSerializer(exam).data, status=status.HTTP_201_CREATED)
