import random, string
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsConsultant, IsNormalUser
from .models import Consultant, ConsultationTime, Reservation
from .serializers import (
    ConsultantSerializer,
    ConsultantManageTimeSerializer,
    ReservationSerializer,
    FreeConsultationCodeSerializer,
    ConsultantWithTimesSerializer
)

# -------------------- Free Consultation --------------------
@extend_schema(
    tags=["Consultation_module"],
    summary="تولید کد تخفیف 100 درصد (فقط یکبار برای هر کاربر)"
)
class FreeConsultationCodeView(views.APIView):
    permission_classes = [IsNormalUser]

    def post(self, request):
        # چک کن کاربر قبلاً رزرو رایگان داشته یا نه
        if Reservation.objects.filter(user=request.user, type="FREE").exists():
            raise ValidationError("شما قبلاً از جلسه رایگان استفاده کرده‌اید.")

        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return Response({"code": code, "percent": 100})


# -------------------- Single Consultation Times --------------------
@extend_schema(
    tags=["Consultation_module"],
    summary="لیست تایم‌های آزاد تک جلسه‌ای"
)
class AvailableSingleTimesView(generics.ListAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return ConsultationTime.objects.filter(
            is_reserved=False,
            start_time__gte=timezone.now()  # فقط تایم‌های آینده
        )



# -------------------- Package Consultants --------------------
@extend_schema(
    tags=["Consultation_module"],
    summary="لیست مشاورانی که حداقل ۵ تایم آزاد در آینده دارند (برای پکیج)"
)
class PackageConsultantsView(generics.ListAPIView):
    serializer_class = ConsultantSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Consultant.objects.annotate(
            free_count=Count("times", filter=Q(times__is_reserved=False, times__start_time__gte=timezone.now()))
        ).filter(free_count__gte=5)


# -------------------- Reservation --------------------
@extend_schema(
    summary="رزرو مشاوره (FREE, SINGLE, PACKAGE)",
    tags=["Consultation_module"],
)
class ReserveConsultationView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsNormalUser]

    def perform_create(self, serializer):
        user = self.request.user
        type_choice = serializer.validated_data.get("type")
        times = serializer.validated_data.get("times")

        # 🚨 منطق اعتبارسنجی
        if type_choice == "FREE":
            if Reservation.objects.filter(user=user, type="FREE").exists():
                raise ValidationError("شما قبلاً جلسه رایگان گرفته‌اید.")
            if len(times) != 1:
                raise ValidationError("جلسه رایگان فقط می‌تواند یک تایم داشته باشد.")

        elif type_choice == "SINGLE":
            if len(times) != 1:
                raise ValidationError("جلسه تک جلسه‌ای فقط باید یک تایم داشته باشد.")

        elif type_choice == "PACKAGE":
            if len(times) != 5:
                raise ValidationError("پکیج باید دقیقاً ۵ تایم داشته باشد.")

        # جلوگیری از رزرو دوباره تایم
        for t in times:
            if t.is_reserved:
                raise ValidationError(f"تایم {t.start_time} قبلاً رزرو شده است.")

        reservation = serializer.save(user=user)
        times.update(is_reserved=True)
        return reservation


# -------------------- My Reservations --------------------
@extend_schema(
    tags=["Consultation_module"],
    summary="لیست جلسات رزرو شده (غیر تکمیل‌شده)"
)
class MyReservationsView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).exclude(
            is_completed_by_user=True, is_completed_by_consultant=True
        ).order_by("-created_at")


@extend_schema(
    tags=["Consultation_module"],
    summary="لیست جلسات تکمیل‌شده"
)
class MyCompletedReservationsView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Reservation.objects.filter(
            user=self.request.user,
            is_completed_by_user=True,
            is_completed_by_consultant=True,
        ).order_by("-created_at")


# -------------------- Complete Reservation --------------------
@extend_schema(
    summary="اتمام مشاوره توسط کاربر",
    tags=["Consultation_module"],
)
class CompleteByUserView(views.APIView):
    permission_classes = [IsNormalUser]

    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, id=pk, user=request.user)
        reservation.is_completed_by_user = True
        if reservation.is_fully_completed():
            reservation.status = "COMPLETED"
        reservation.save()
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


@extend_schema(
    summary="اتمام مشاوره توسط مشاور",
    tags=["Consultation_module"],
)
class CompleteByConsultantView(views.APIView):
    permission_classes = [IsConsultant]

    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, id=pk, consultant__user=request.user)
        reservation.is_completed_by_consultant = True
        if reservation.is_fully_completed():
            reservation.status = "COMPLETED"
        reservation.save()
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


# -------------------- Consultant Times --------------------
@extend_schema(
    summary="لیست تایم‌های آزاد یک مشاور",
    tags=["Consultation_module"],
)
class ConsultantAvailableTimesView(generics.ListAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        consultant_id = self.kwargs["consultant_id"]
        return ConsultationTime.objects.filter(
            consultant_id=consultant_id,
            is_reserved=False,
            start_time__gte=timezone.now()
        ).order_by("start_time")


@extend_schema(
    tags=["Consultant Times"],
    description="مدیریت تایم‌های مشاور (لیست + افزودن)"
)
class ConsultantTimeListCreateView(generics.ListCreateAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsConsultant]

    def _get_consultant_or_403(self):
        try:
            return Consultant.objects.get(user=self.request.user)
        except Consultant.DoesNotExist:
            # اگر می‌خواهی 404 بدی از get_object_or_404 استفاده کن
            raise PermissionDenied("پروفایل مشاور برای این کاربر یافت نشد. لطفاً پروفایل مشاور را ایجاد کنید.")

    def get_queryset(self):
        consultant = self._get_consultant_or_403()
        return ConsultationTime.objects.filter(consultant=consultant)

    def perform_create(self, serializer):
        consultant = self._get_consultant_or_403()
        start_time = serializer.validated_data.get("start_time")
        end_time = serializer.validated_data.get("end_time")

        # ولیدیشن پایه‌ای (در کنار ولیدیشن سیریالایزر)
        if not (start_time and end_time):
            raise ValidationError("start_time و end_time الزامی هستند.")
        if end_time <= start_time:
            raise ValidationError("end_time باید بعد از start_time باشد.")
        if start_time < timezone.now():
            raise ValidationError("start_time باید در آینده باشد.")

        # جلوگیری از overlap
        if ConsultationTime.objects.filter(
            consultant=consultant,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists():
            raise ValidationError("این تایم با تایم‌های دیگر تداخل دارد.")

        serializer.save(consultant=consultant)


@extend_schema(
    tags=["Consultant Times"],
    description="ویرایش یا حذف تایم مشاور (حداقل ۷ روز قبل از شروع جلسه)"
)
class ConsultantTimeUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsConsultant]

    def get_queryset(self):
        consultant = Consultant.objects.get(user=self.request.user)
        return ConsultationTime.objects.filter(consultant=consultant)

    def perform_update(self, serializer):
        obj = self.get_object()
        if obj.is_reserved:
            raise PermissionDenied("نمی‌توانید تایم رزرو شده را تغییر دهید.")
        if not obj.can_edit():
            raise PermissionDenied("شما فقط تا ۷ روز قبل از جلسه می‌توانید تغییر دهید.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.is_reserved:
            raise PermissionDenied("نمی‌توانید تایم رزرو شده را حذف کنید.")
        if not instance.can_edit():
            raise PermissionDenied("شما فقط تا ۷ روز قبل از جلسه می‌توانید حذف کنید.")
        instance.delete()


# -------------------- Consultants with Available Times --------------------
@extend_schema(
    summary="لیست مشاوران با تایم آزاد (برای SINGLE)",
    tags=["Consultation_module"],
)
class SingleConsultantsWithTimesView(generics.ListAPIView):
    serializer_class = ConsultantWithTimesSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Consultant.objects.filter(
            times__is_reserved=False
        ).distinct()