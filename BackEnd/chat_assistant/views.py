from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Chat
from .serializers import ChatSerializer
from django.shortcuts import get_object_or_404

# Create your views here.

def get_ai_response(user_message):
    return f"پاسخ AI به {user_message}"

class NewChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        chat = Chat.objects.create(user=request.user, content=[])
        serializer = ChatSerializer(chat)
        return Response(serializer.data, status=201)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username, chat_id):
        chat = get_object_or_404(Chat, user__username=username, id=chat_id)

        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=400)

        chat.content.append({"sender": "user", "message": message})
        bot_response = f"Echo: {message}"
        chat.content.append({"sender": "bot", "message": bot_response})
        chat.save()
        serializer = ChatSerializer(chat)
        return Response(serializer.data)


class ChatHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username, chat_id):
        chat = get_object_or_404(Chat, user__username=username, id=chat_id)
        serializer = ChatSerializer(chat)
        return Response(serializer.data)

# class ChatHistoryView(APIView):
#     permission_class = [permissions.IsAuthenticated]

#     def get(self, request):
#         messages = Message.objects.filter(user=request.user)
#         serializer = MessageSerializer(messages, many=True)
#         return Response(serializer.data)
    
# class SendMessageView(APIView):
#     permission_class = [permissions.IsAuthenticated]

#     def post(self, request):
#         user_msg = request.data.get("content")
#         if not user_msg:
#             return Response({"error": "متن پیام نمی تواند خالی باشد"}, status=status.HTTP_400_BAD_REQUEST)
#         msg_user = Message.objects.create(user=request.user, role='user', content=user_msg)

#         ai_answer = get_ai_response(user_msg)
#         msg_ai = Message.objects.create(user=request.user, role='ai', content=ai_answer)

#         return Response({
#                 "user_message": MessageSerializer(msg_user).data,
#                 "ai_message": MessageSerializer(msg_ai).data
#             }, status=status.HTTP_201_CREATED)

