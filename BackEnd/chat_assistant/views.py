from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Message
from .serializers import MessageSerializer

# Create your views here.

def get_ai_response(user_message):
    return f"پاسخ AI به {user_message}"

class ChatHistoryView(APIView):
    permission_class = [permissions.IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(user=request.user)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
class SendMessageView(APIView):
    permission_class = [permissions.IsAuthenticated]

    def post(self, request):
        user_msg = request.data.get("content")
        if not user_msg:
            return Response({"error": "متن پیام نمی تواند خالی باشد"}, status=status.HTTP_400_BAD_REQUEST)
        msg_user = Message.objects.create(user=request.user, role='user', content=user_msg)

        ai_answer = get_ai_response(user_msg)
        msg_ai = Message.objects.create(user=request.user, role='ai', content=ai_answer)

        return Response({
                "user_message": MessageSerializer(msg_user).data,
                "ai_message": MessageSerializer(msg_ai).data
            }, status=status.HTTP_201_CREATED)