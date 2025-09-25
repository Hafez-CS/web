from django.contrib import admin
from .models import Exam

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'user', 'score', 'created_at']
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ['user']
    search_fields = ['title', 'slug']