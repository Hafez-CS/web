from rest_framework import serializers
from .models import Exam

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'title', 'slug', 'questions', 'user', 'answers', 'score', 'created_at']
        read_only_fields = ['slug', 'score', 'created_at']