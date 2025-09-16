from rest_framework import serializers
from .models import Exam, Question, UserScore, UserAnswer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'options']

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ['title', 'questions']

class UserAnswerSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.CharField(max_length=100))

class UserScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScore
        fields = ['score', 'created_at', 'ai_response']