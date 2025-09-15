from rest_framework import serializers
from .models import Chat, ChatRoom

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "slug", "name", "created_at"]
    
class ChatSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["user", "updated_at"]
