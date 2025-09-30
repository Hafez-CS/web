from rest_framework import generics
from accounts.models import UserProfile
from accounts.serializers import UserSerializer
from accounts.permissions import IsPlatformAdmin
from drf_spectacular.utils import extend_schema

# Create your views here.

@extend_schema(
    tags=["Consultants_admin_platform_module"],
    description="لیست یا ایجاد مشاور جدید (فقط مدیر پلتفرم دسترسی دارد)."
)
class ConsultantListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='consultant')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]

    def perform_create(self, serializer):
        # 🔒 نقش همیشه consultant باشد
        serializer.save(role="consultant")


@extend_schema(
    tags=["Consultants_admin_platform_module"],
    description="دریافت، ویرایش یا حذف مشاور (فقط مدیر پلتفرم دسترسی دارد)."
)
class ConsultantRetrieveUpdateOrDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.filter(role='consultant')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


@extend_schema(
    tags=["SchoolAdmins_admin_platform_module"],
    description="لیست یا ایجاد مدیر مجموعه (فقط مدیر پلتفرم دسترسی دارد)."
)
class SchoolAdminListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='school_admin')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]

    def perform_create(self, serializer):
        # 🔒 نقش همیشه school_admin باشد
        serializer.save(role="school_admin")


@extend_schema(
    tags=["SchoolAdmins_admin_platform_module"],
    description="دریافت، ویرایش یا حذف مدیر مجموعه (فقط مدیر پلتفرم دسترسی دارد)."
)
class SchoolAdminRetrieveUpdateOrDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.filter(role='school_admin')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]
