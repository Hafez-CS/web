from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import UserProfile
from accounts.serializers import UserCreateByAdminSerializer, UserSerializer
from accounts.permissions import IsPlatformAdmin
from consultation_module.models import Consultation, ConsultationStatus
from drf_spectacular.utils import extend_schema
from django.db.models import Q, Count


# ===== CONSULTANTS MANAGEMENT =====
@extend_schema(
    tags=["Admin-Consultants"],
    summary="لیست یا ایجاد مشاور",
    description="مشاهده لیست مشاوران یا ایجاد مشاور جدید (فقط مدیر پلتفرم)"
)
class ConsultantListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='consultant')
    serializer_class = UserCreateByAdminSerializer
    permission_classes = [IsPlatformAdmin]

    def perform_create(self, serializer):
        serializer.save(role="consultant")


@extend_schema(
    tags=["Admin-Consultants"],
    summary="مشاهده، ویرایش یا حذف مشاور",
    description="دریافت، ویرایش یا حذف مشاور خاص"
)
class ConsultantRetrieveUpdateOrDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.filter(role='consultant')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


# ===== USERS MANAGEMENT =====
@extend_schema(
    tags=["Admin-Users"],
    summary="لیست یا ایجاد کاربر عادی",
    description="مشاهده لیست کاربران عادی یا ایجاد کاربر جدید"
)
class UserListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='normal')
    serializer_class = UserCreateByAdminSerializer
    permission_classes = [IsPlatformAdmin]

    def perform_create(self, serializer):
        serializer.save(role="normal")


@extend_schema(
    tags=["Admin-Users"],
    summary="مشاهده، ویرایش یا حذف کاربر",
    description="دریافت، ویرایش یا حذف کاربر عادی خاص"
)
class UserRetrieveUpdateOrDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.filter(role='normal')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


# ===== SCHOOL ADMINS (ORGANIZATION MANAGERS) MANAGEMENT =====
@extend_schema(
    tags=["Admin-SchoolAdmins"],
    summary="لیست یا ایجاد مدیر مجموعه",
    description="مشاهده لیست مدیران مجموعه یا ایجاد مدیر جدید"
)
class SchoolAdminListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='school_admin')
    serializer_class = UserCreateByAdminSerializer
    permission_classes = [IsPlatformAdmin]

    def perform_create(self, serializer):
        serializer.save(role="school_admin")


@extend_schema(
    tags=["Admin-SchoolAdmins"],
    summary="مشاهده، ویرایش یا حذف مدیر مجموعه",
    description="دریافت، ویرایش یا حذف مدیر مجموعه خاص"
)
class SchoolAdminRetrieveUpdateOrDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.filter(role='school_admin')
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


# ===== REPORTS & STATISTICS =====
@extend_schema(
    tags=["Admin-Reports"],
    summary="گزارش کامل آماری پلتفرم",
    description="نمایش تعداد کاربران فعال، مشاوران، مدیران مجموعه و مشاوره‌های در حال انجام"
)
class PlatformReportsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        """گزارش آماری کامل پلتفرم"""
        
        # تعداد کاربران فعال
        active_users = UserProfile.objects.filter(
            role='normal',
            is_active=True
        ).count()
        
        # تعداد مشاوران فعال
        active_consultants = UserProfile.objects.filter(
            role='consultant',
            is_active=True
        ).count()
        
        # تعداد مدیران مجموعه فعال
        active_school_admins = UserProfile.objects.filter(
            role='school_admin',
            is_active=True
        ).count()
        
        # تعداد مشاوره‌های در حال انجام
        ongoing_consultations = Consultation.objects.filter(
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).count()
        
        # تعداد مشاوره‌های تکمیل شده
        completed_consultations = Consultation.objects.filter(
            status=ConsultationStatus.COMPLETED
        ).count()
        
        # مجموع کل مشاوره‌ها
        total_consultations = Consultation.objects.count()
        
        return Response({
            'active_users': active_users,
            'active_consultants': active_consultants,
            'active_school_admins': active_school_admins,
            'ongoing_consultations': ongoing_consultations,
            'completed_consultations': completed_consultations,
            'total_consultations': total_consultations,
            'chart_data': {
                'users': active_users,
                'consultants': active_consultants,
                'school_admins': active_school_admins,
                'ongoing_consultations': ongoing_consultations
            }
        }, status=status.HTTP_200_OK)