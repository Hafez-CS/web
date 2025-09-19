from django.contrib import admin
from .models import Exam

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'score', 'created_at']
    search_fields = ['title', 'user__username']
    list_filter = ['title']