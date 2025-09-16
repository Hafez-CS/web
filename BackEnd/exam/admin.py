from django.contrib import admin
from .models import Exam, Question, UserScore, UserAnswer

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    search_fields = ['title']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['exam', 'question_text', 'correct_answer']
    search_fields = ['exam__title', 'question_text']
    list_filter = ['exam']

@admin.register(UserScore)
class UserScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'exam', 'score', 'created_at', 'ai_response']
    search_fields = ['user__username', 'exam__title']

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ['user', 'exam', 'question', 'answer', 'created_at']
    search_fields = ['user__username', 'exam__title', 'question__question_text']
    list_filter = ['exam']