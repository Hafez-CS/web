from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Idea
from .serializers import IdeaSerializer, IdeaCreateSerializer, IdeaListSerializer, AdminIdeaListSerializer
from chat_assistant.models import Chat, ChatRoom
from chat_assistant.ai_client import send_to_ai
from drf_spectacular.utils import extend_schema, OpenApiResponse

class CreateIdeaView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IdeaCreateSerializer

    @extend_schema(
        summary="ایجاد ایده جدید",
        description="کاربر عادی می‌تواند ایده جدید ثبت کند. اتاق چت اختصاصی و تصویر AI برای ایده فیزیکی تولید می‌شود",
        request=IdeaCreateSerializer,
        responses={
            201: IdeaSerializer,
            400: OpenApiResponse(description="خطای اعتبارسنجی"),
            403: OpenApiResponse(description="فقط کاربران عادی مجاز هستند")
        },
        tags=["Startup_Ideas_User_Panel"]
    )
    def create(self, request, *args, **kwargs):
        if request.user.role != 'normal':
            return Response({
                "detail": "فقط کاربران عادی می‌توانند ایده ثبت کنند"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idea = serializer.save(user=request.user)

        chat, _ = Chat.objects.get_or_create(user=request.user)
        room_name = f"ایده: {idea.idea_name}"
        room = ChatRoom.objects.create(user=request.user, chat=chat, name=room_name)

        idea_context = (
            f"نام ایده: {idea.idea_name}\n"
            f"شرح ایده: {idea.idea_description}\n"
            f"نوع ایده: {'فیزیکی' if idea.idea_type == 'physical' else 'پلتفرمی'}\n"
            f"وضعیت اجرا: {'اجرا شده' if idea.is_implemented else 'اجرا نشده'}\n"
        )
        if idea.idea_type == 'physical' and idea.physical_description:
            idea_context += f"شرح فیزیکی: {idea.physical_description}\n"

        system_msg = {
            "role": "system",
            "content": f"تو یک مشاور کسب‌وکار هستی. کاربر ایده‌ای دارد:\n{idea_context}\nلطفاً در مورد امکان‌سنجی، چالش‌ها و پیشنهادات بحث کن."
        }

        if not isinstance(chat.content, list):
            chat.content = []
        chat.content.append({
            "id": str(room.id),
            "room": room.slug,
            "sender": "system",
            "message": idea_context,
            "timestamp": room.created_at.isoformat()
        })
        chat.save()

        idea.chat_room_slug = room.slug

        if idea.idea_type == 'physical' and idea.physical_description:
            image_prompt = f"یک تصویر برای محصول فیزیکی با این مشخصات تولید شد: {idea.physical_description}"
            idea.generated_image = image_prompt
        else:
            idea.generated_image = "تصویر پیش‌فرض برای ایده پلتفرمی"

        idea.save()

        return Response(IdeaSerializer(idea).data, status=status.HTTP_201_CREATED)

class ListUserIdeasView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IdeaListSerializer

    @extend_schema(
        summary="لیست ایده‌های کاربر",
        description="نمایش تمام ایده‌های ثبت شده توسط کاربر لاگین‌شده",
        responses={200: IdeaListSerializer(many=True)},
        tags=["Startup_Ideas_User_Panel"]
    )
    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

class IdeaDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IdeaSerializer
    lookup_field = 'id'

    @extend_schema(
        summary="جزئیات ایده",
        description="نمایش جزئیات کامل یک ایده",
        responses={
            200: IdeaSerializer,
            404: OpenApiResponse(description="ایده یافت نشد")
        },
        tags=["Startup_Ideas_User_Panel"]
    )
    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

class AdminListAllIdeasView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AdminIdeaListSerializer

    @extend_schema(
        summary="لیست تمام ایده‌ها (مدیریت)",
        description="نمایش تمام ایده‌های کاربران برای مدیران پلتفرم",
        responses={
            200: AdminIdeaListSerializer(many=True),
            403: OpenApiResponse(description="فقط مدیران مجاز هستند")
        },
        tags=["Startup_Ideas_Management_Panel"]
    )
    def get_queryset(self):
        if self.request.user.role not in ['platform_admin', 'school_admin']:
            return Idea.objects.none()
        return Idea.objects.all().select_related('user')

class AdminIdeaDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IdeaSerializer
    lookup_field = 'id'

    @extend_schema(
        summary="جزئیات ایده (مدیریت)",
        description="نمایش جزئیات کامل ایده با اطلاعات کاربر برای مدیران",
        responses={
            200: IdeaSerializer,
            403: OpenApiResponse(description="فقط مدیران مجاز هستند"),
            404: OpenApiResponse(description="ایده یافت نشد")
        },
        tags=["Startup_Ideas_Management_Panel"]
    )
    def get_queryset(self):
        if self.request.user.role not in ['platform_admin', 'school_admin']:
            return Idea.objects.none()
        return Idea.objects.all().select_related('user')
