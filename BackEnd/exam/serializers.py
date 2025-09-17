from rest_framework import serializers
from .models import Exam

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ["id", "title", "score", "created_at"]
        read_only_fields = ["score", "created_at"]
