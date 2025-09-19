# exam/serializers.py
from rest_framework import serializers
from .models import Exam

class ExamSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Exam
        fields = ["id", "user", "title", "score", "created_at"]
        read_only_fields = ["score", "created_at", "user"]