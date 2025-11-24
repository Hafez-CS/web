from django.contrib import admin
from .models import Idea

@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ['idea_name', 'user', 'idea_type', 'is_implemented', 'created_at']
    list_filter = ['idea_type', 'is_implemented', 'created_at']
    search_fields = ['idea_name', 'idea_description', 'user__email']
