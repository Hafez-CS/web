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
import re
from .ai_client import send_to_ai
from exam.models import Exam
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

MAX_LIMIT = 1000
DEFAULT_LIMIT = 100

class NewChatRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string', 'description': 'نام اتاق چت (اختیاری)'},
                },
            }
        },
        responses={
            201: ChatRoomSerializer,
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
        },
        tags = ["Chat_module"],
        summary="ایجاد یک اتاق چت جدید",
        description="ایجاد یک اتاق چت برای کاربر لاگین‌شده با نام اختیاری",
    )
    def post(self, request):
        chat, _ = Chat.objects.get_or_create(user=request.user)
        name = request.data.get("name", "")
        room = ChatRoom.objects.create(user=request.user, chat=chat, name=name)
        return Response(ChatRoomSerializer(room).data, status=status.HTTP_201_CREATED)
    
class ListChatRoomsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: ChatRoomSerializer(many=True)},
        tags = ["Chat_module"],
        summary="لیست اتاق‌های چت کاربر",
        description="بازگرداندن تمام اتاق‌های چت کاربر لاگین‌شده به ترتیب تاریخ ایجاد",
    )
    def get(self, request):
        rooms = ChatRoom.objects.filter(user=request.user).order_by('-created_at')
        serializer = ChatRoomSerializer(rooms, many=True)
        return Response(serializer.data)

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='slug', type=str, location=OpenApiParameter.PATH, description='شناسه اتاق چت'),
        ],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string', 'description': 'متن پیام کاربر'},
                },
                'required': ['message'],
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'room': {'type': 'string', 'description': 'شناسه اتاق چت'},
                    'messages': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'string'},
                                'room': {'type': 'string'},
                                'sender': {'type': 'string', 'enum': ['user', 'bot']},
                                'message': {'type': 'string'},
                                'timestamp': {'type': 'string', 'format': 'date-time'},
                            },
                        },
                    },
                },
            },
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
        },
        tags = ["Chat_module"],
        summary="ارسال پیام به اتاق چت",
        description="ارسال پیام کاربر به اتاق چت، دریافت پاسخ از AI، و به‌روزرسانی خلاصه اتاق",
    )
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
            "تمام پیام‌های قبلی این مکالمه و خلاصه‌های اتاق‌های دیگر کاربر رو در نظر بگیر و پاسخ رو مرتبط با موضوع مکالمه نگه دار. "
            "اگه کاربر درخواست تحلیل آزمون کرد، اطلاعات آزمونش رو تحلیل کن و توضیح بده."
        )

        all_messages = chat.content or []
        room_messages = [m for m in all_messages if m.get("room") == room.slug]

        summaries = chat.summary or {}
        other_summaries = "\n".join([
            f"خلاصه اتاق {room_slug}: {summary}"
            for room_slug, summary in summaries.items()
            if room_slug != room.slug
        ]) or "هیچ خلاصه‌ای برای اتاق‌های دیگر موجود نیست."

        is_exam_analysis = re.search(r'\b(تحلیل|آزمون|بررسی)\b', message_text, re.IGNORECASE)
        prompt = message_text

        if is_exam_analysis:
            exam_title = room.name.replace("دستیار برای آزمون ", "")
            exam = Exam.objects.filter(user=request.user, title=exam_title).first()
            exam_data = get_exam_by_slug(slug=exam.slug) if exam else None
            if exam and exam_data:
                questions_str = "\n".join([f"سوال {q['id']}: {q['text']} (پاسخ درست: {q['options'][q['answer']]})" for q in exam_data["questions"]])
                prompt = (
                    f"کاربر '{request.user.username}' در آزمون '{exam_title}' شرکت کرده و {exam.score} از {len(exam_data['questions'])} امتیاز گرفته. "
                    f"سوال‌های آزمون:\n{questions_str}\n"
                    f"لطفاً تحلیل کن که کاربر در کدام سوال‌ها اشتباه کرده و توضیح ساده و آموزشی به فارسی بده که چطور می‌تونه ایراداتش رو برطرف کنه. "
                    f"اگه همه جواب‌ها درست بود، یه پیام تشویقی بنویس."
                )
            else:
                prompt = "آزمون یافت نشد. لطفاً اطلاعات آزمون را بررسی کنید."

        api_messages = [
            {
                "role": "system",
                "content": system_prompt + f"\nخلاصه‌های اتاق‌های دیگر کاربر:\n{other_summaries}"
            }
        ]
        for msg in room_messages[-5:]:  
            role = "user" if msg.get("sender") == "user" else "assistant"
            api_messages.append({"role": role, "content": msg.get("message")})
        api_messages.append({"role": "user", "content": prompt})

        ai_message = send_to_ai(api_messages, system_prompt=system_prompt)

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

            room_messages_updated = room_messages + [user_msg, ai_msg]
            messages_str = "\n".join([f"{m['sender']}: {m['message']}" for m in room_messages_updated[-5:]])
            summary_prompt = (
                f"این تاریخچه مکالمات کاربر در اتاق {room.slug} است:\n{messages_str}\n"
                f"لطفاً یک خلاصه کوتاه (2-3 جمله) از موضوع اصلی مکالمه بنویس که نشان‌دهنده علایق و نیازهای کاربر باشد."
            )
            ai_summary = send_to_ai([{"role": "user", "content": summary_prompt}], system_prompt="تو یک دستیار باهوش هستی که خلاصه‌های کوتاه و دقیق به فارسی می‌نویسی.")

            if not isinstance(chat.summary, dict):
                chat.summary = {}
            chat.summary[room.slug] = ai_summary
            chat.save(update_fields=["content", "summary", "updated_at"])

        return Response({
            "room": room.slug,
            "messages": [user_msg, ai_msg]
        }, status=status.HTTP_200_OK)

class ChatHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='slug', type=str, location=OpenApiParameter.PATH, description='شناسه اتاق چت'),
            OpenApiParameter(name='limit', type=int, location=OpenApiParameter.QUERY, description='حداکثر تعداد پیام‌ها', default=DEFAULT_LIMIT),
            OpenApiParameter(name='since', type=str, location=OpenApiParameter.QUERY, description='فیلتر پیام‌ها بر اساس تاریخ ISO'),
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'room': {'type': 'string'},
                    'count': {'type': 'integer'},
                    'offset': {'type': 'integer'},
                    'limit': {'type': 'integer'},
                    'messages': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'string'},
                                'room': {'type': 'string'},
                                'sender': {'type': 'string', 'enum': ['user', 'bot']},
                                'message': {'type': 'string'},
                                'timestamp': {'type': 'string', 'format': 'date-time'},
                            },
                        },
                    },
                },
            },
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
        },
        tags = ["Chat_module"],
        summary="دریافت تاریخچه چت",
        description="بازگرداندن پیام‌های یک اتاق چت با امکان فیلتر و صفحه‌بندی",
    )
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
            offset = int(request.query_params.get("offset", 0))
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


    @extend_schema(
        summary="لیست چت‌های کاربر فعلی",
        description=(
            "این endpoint تمام چت‌های متعلق به کاربر وارد‌شده را برمی‌گرداند.\n"
            "خروجی به شکل یک آبجکت شامل کلید `chats` است که لیستی از چت‌ها دارد."
        ),
        tags=["Chat_module"]
    )
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

class SendAiForSummary(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='slug', type=str, location=OpenApiParameter.PATH, description='شناسه اتاق چت'),
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'room': {'type': 'string', 'description': 'شناسه اتاق چت'},
                    'summary': {'type': 'string', 'description': 'خلاصه مکالمات'},
                },
            },
            400: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
            404: {'type': 'object', 'properties': {'error': {'type': 'string'}}},
        },
        tags = ["Chat_module"],
        summary="دریافت خلاصه مکالمات اتاق چت",
        description="گرفتن تاریخچه پیام‌های یک اتاق چت، ارسال به AI برای خلاصه‌سازی، و ذخیره خلاصه در مدل Chat",
    )
    def get(self, request, slug):
        room = get_object_or_404(ChatRoom, slug=slug, user=request.user)
        chat = room.chat

        all_messages = chat.content or []
        room_messages = [m for m in all_messages if m.get("room") == room.slug]

        if not room_messages:
            return Response({
                "error": "هیچ پیامی در این اتاق یافت نشد"
            }, status=status.HTTP_400_BAD_REQUEST)

        messages_str = "\n".join([f"{m['sender']}: {m['message']}" for m in room_messages[-5:]])
        system_prompt = "تو یک دستیار باهوش هستی که خلاصه‌های کوتاه و دقیق به فارسی می‌نویسی."
        prompt = (
            f"این تاریخچه مکالمات کاربر در اتاق {slug} است:\n{messages_str}\n"
            f"لطفاً یک خلاصه کوتاه (2-3 جمله) از موضوع اصلی مکالمه بنویس که نشان‌دهنده علایق و نیازهای کاربر باشد."
        )

        ai_summary = send_to_ai([{"role": "user", "content": prompt}], system_prompt=system_prompt)

        with transaction.atomic():
            chat = Chat.objects.select_for_update().get(pk=chat.pk)
            if not isinstance(chat.summary, dict):
                chat.summary = {}
            chat.summary[room.slug] = ai_summary
            chat.save(update_fields=["summary", "updated_at"])

        return Response({
            "room": room.slug,
            "summary": ai_summary
        }, status=status.HTTP_200_OK)
