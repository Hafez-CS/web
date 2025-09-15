from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Chat, ChatRoom
from .serializers import ChatRoomSerializer, ChatSummarySerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.utils.dateparse import parse_datetime
import uuid

# Create your views here.

MAX_LIMIT = 1000
DEFAULT_LIMIT = 100

class NewChatRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        chat, _ = Chat.objects.get_or_create(user=request.user)
        name = request.data.get("name", "")
        room = ChatRoom.objects.create(user=request.user, chat=chat, name=name)
        return Response(ChatRoomSerializer(room).data, status=status.HTTP_201_CREATED)
    
class ListChatRoomsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rooms = ChatRoom.objects.filter(user=request.user).order_by('-created_at')
        serializer = ChatRoomSerializer(rooms, many=True)
        return Response(serializer.data)

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        room = get_object_or_404(ChatRoom, slug=slug, user=request.user)
        chat = room.chat

        message_text = request.data.get("message")
        if not message_text:
            return Response({
                "error": "message is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        user_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "user",
            "message": message_text,
            "timestamp": timezone.now().isoformat()
        }

        ai_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "bot",
            "message": f"Echo: {message_text}",
            "timestamp": timezone.now().isoformat()
        }

        with transaction.atomic():
            chat = Chat.objects.select_for_update().get(pk=chat.pk)
            # Ensure chat.content is a list
            if not isinstance(chat.content, list):
                chat.content = []
            chat.content.append(user_msg)
            chat.content.append(ai_msg)
            chat.save(update_fields=["content", "updated_at"])

        return Response({
            "room": room.slug,
            "messages": [user_msg, ai_msg]
        }, status=status.HTTP_200_OK)
    
class ChatHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        room = get_object_or_404(ChatRoom, slug=slug, user=request.user)
        chat = room.chat

        all_messages = chat.content or []
        room_messages = [m for m in all_messages if m.get("room") == room.slug]

        try:
            limit = min(int(request.query_params.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
        except ValueError:
            limit = DEFAULT_LIMIT
        try:
            offset = int(request.query_params.get("since", 0))
        except ValueError:
            offset = 0

        since = request.query_params.get("since")
        if since:
            dt = parse_datetime(since)
            if not dt:
                return Response({
                    "error": "since must be an ISO datetime"
                }, status=status.HTTP_400_BAD_REQUEST)
            room_messages = [m for m in room_messages if parse_datetime(m.get("timestamp")) and parse_datetime(m.get("timestamp")) > dt]
        
        total = len(room_messages)
        slice_messages = room_messages[offset: offset + limit]

        return Response({
            "room": room.slug,
            "count": total,
            "offset": offset,
            "limit": limit,
            "messages": slice_messages
        })
    
class ChatContentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        chats = Chat.objects.filter(user=request.user)
        data = []
        for chat in chats:
            data.append({
                "id": chat.id,
                "content": chat.content,
                "updated_at": chat.updated_at,
            })
        return Response({"chats": data}, status=status.HTTP_200_OK)
