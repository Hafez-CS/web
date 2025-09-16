from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Exam, Question, UserScore, UserAnswer
from .serializers import ExamSerializer, UserAnswerSerializer, UserScoreSerializer
from accounts.models import UserProfile

class ExamDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, title):
        try:
            exam = Exam.objects.get(title=title)
            serializer = ExamSerializer(exam)
            return Response({
                "success": True,
                "message": "سوال‌ها با موفقیت دریافت شد.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exam.DoesNotExist:
            return Response({
                "success": False,
                "detail": "آزمون یافت نشد."
            }, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, title):
        try:
            exam = Exam.objects.get(title=title)
        except Exam.DoesNotExist:
            return Response({
                "success": False,
                "detail": "آزمون یافت نشد."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = UserAnswerSerializer(data=request.data)
        if serializer.is_valid():
            answers = serializer.validated_data['answers']
            questions = exam.questions.all()
            score = 0

            for question in questions:
                question_id = str(question.id)
                if question_id in answers:
                    if UserAnswer.objects.filter(user=request.user, exam=exam, question=question).exists():
                        return Response({
                            "success": False,
                            "detail": f"شما قبلاً برای سوال {question_id} پاسخ داده‌اید."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    UserAnswer.objects.create(
                        user=request.user,
                        exam=exam,
                        question=question,
                        answer=answers[question_id]
                    )
                    if answers[question_id] == question.correct_answer:
                        score += 1

            if UserScore.objects.filter(user=request.user, exam=exam).exists():
                return Response({
                    "success": False,
                    "detail": "شما قبلاً در این آزمون شرکت کرده‌اید."
                }, status=status.HTTP_400_BAD_REQUEST)

            ai_response = self.send_to_ai(exam.title, score, request.user, len(questions), answers)
            user_score = UserScore.objects.create(
                user=request.user,
                exam=exam,
                score=score,
                ai_response=ai_response
            )
            score_serializer = UserScoreSerializer(user_score)
            return Response({
                "success": True,
                "message": "پاسخ‌ها ثبت شد و تحلیل AI ذخیره شد.",
                "data": score_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "detail": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def send_to_ai(self, title, score, user, total_questions, answers):
        answers_str = ", ".join([f"سوال {k}: {v}" for k, v in answers.items()])
        return f"تحلیل AI برای آزمون '{title}': امتیاز کاربر {user.username} برابر {score} از {total_questions} است. پاسخ‌ها: {answers_str}. {'عالی!' if score == total_questions else 'دوباره تلاش کنید!'}"