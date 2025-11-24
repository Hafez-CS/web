from rest_framework import serializers
from .models import Idea
from accounts.models import UserProfile

class IdeaSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = ['id', 'idea_name', 'idea_description', 'is_implemented', 'idea_type',
                  'physical_description', 'generated_image', 'chat_room_slug',
                  'user_email', 'user_name', 'created_at', 'updated_at']
        read_only_fields = ['generated_image', 'chat_room_slug', 'user_email', 'user_name']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def validate(self, data):
        if data.get('idea_type') == 'physical' and not data.get('physical_description'):
            raise serializers.ValidationError({
                'physical_description': 'شرح فیزیک محصول برای ایده‌های فیزیکی الزامی است'
            })
        return data

class IdeaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ['idea_name', 'idea_description', 'is_implemented', 'idea_type', 'physical_description']

    def validate(self, data):
        if data.get('idea_type') == 'physical' and not data.get('physical_description'):
            raise serializers.ValidationError({
                'physical_description': 'شرح فیزیک محصول برای ایده‌های فیزیکی الزامی است'
            })
        return data

class IdeaListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ['id', 'idea_name', 'idea_type', 'is_implemented', 'created_at']

class AdminIdeaListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = ['id', 'idea_name', 'idea_type', 'is_implemented', 'user_email', 'user_name', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
