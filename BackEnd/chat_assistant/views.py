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
from openai import OpenAI 
from django.conf import settings
from exam.models import Exam
import re

QUESTIONS = [
    {
        "id": 1,
        "question_text": "بزرگ‌ترین سیاره چیست؟",
        "options": {"A": "مشتری", "B": "زحل", "C": "زمین", "D": "مریخ"},
        "correct_answer": "A"
    },
    {
        "id": 2,
        "question_text": "ماه چند روزه دور زمین می‌چرخه؟",
        "options": {"A": "14 روز", "B": "28 روز", "C": "30 روز", "D": "365 روز"},
        "correct_answer": "B"
    }
]

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

        system_prompt = (
            "تو یک معلم حرفه‌ای و صبور هستی که توضیحات ساده و آموزشی به فارسی می‌دی. "
            "اگه کاربر درخواست تحلیل آزمون کرد، اطلاعات آزمونش رو تحلیل کن و توضیح بده."
        )

        all_messages = chat.content or []
        room_messages = [m for m in all_messages if m.get("room") == room.slug]

        is_exam_analysis = re.search(r'\b(تحلیل|آزمون|بررسی)\b', message_text, re.IGNORECASE)
        ai_message = ""

        if is_exam_analysis:
            exam_title = room.name.replace("کمک برای آزمون ", "")
            exam = Exam.objects.filter(user=request.user, title=exam_title).first()
            if exam:
                questions_str = "\n".join([f"سوال {q['id']}: {q['question_text']} (پاسخ درست: {q['correct_answer']})" for q in QUESTIONS])
                prompt = (
                    f"تو یک معلم حرفه‌ای و صبور هستی. کاربر '{request.user.username}' در آزمون '{exam_title}' شرکت کرده و {exam.score} از {len(QUESTIONS)} امتیاز گرفته. "
                    f". سوال‌های آزمون:\n{questions_str}\n"
                    f"لطفاً تحلیل کن که کاربر در کدام سوال‌ها اشتباه کرده و توضیح ساده و آموزشی به فارسی بده که چطور می‌تونه ایراداتش رو برطرف کنه. "
                    f"اگه همه جواب‌ها درست بود، یه پیام تشویقی بنویس."
                )
            else:
                prompt = "متأسفم، اطلاعات آزمون پیدا نشد. لطفاً دوباره تلاش کنید یا جزئیات بیشتری بدید."
        else:
            prompt = message_text

        api_messages = [{"role": "system", "content": system_prompt}]
        for msg in room_messages[-5:]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            api_messages.append({"role": role, "content": msg.get("message")})
        api_messages.append({"role": "user", "content": prompt})

        client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )
        try:
            response = client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=api_messages,
                stream=False,
                temperature=0.7,
                max_tokens=500
            )
            ai_message = response.choices[0].message.content
        except Exception as e:
            ai_message = f"خطا در ارتباط با AI: {str(e)}"

        ai_msg = {
            "id": str(uuid.uuid4()),
            "room": room.slug,
            "sender": "bot",
            "message": ai_message,
            "timestamp": timezone.now().isoformat()
        }

        with transaction.atomic():
            chat = Chat.objects.select_for_update().get(pk=chat.pk)
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