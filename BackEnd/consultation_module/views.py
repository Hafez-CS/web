import random, string
from rest_framework import generics, status, views
from rest_framework.response import Response
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
    tags = ["Consultation_module"],
    summary="تولید کد تخفیف 100 درصد",
    responses=FreeConsultationCodeSerializer,
)
class FreeConsultationCodeView(views.APIView):
    permission_classes = [IsNormalUser]

    def post(self, request):
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return Response({"code": code, "percent": 100})


# -------------------- Single Consultation --------------------
@extend_schema(
    tags = ["Consultation_module"],
    summary="لیست تمام مشاورانی که تایم تک جلسه ای دارن",
    responses=ConsultantManageTimeSerializer(many=True),
)
class SingleConsultationTimesView(generics.ListAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return ConsultationTime.objects.filter(is_reserved=False)


# -------------------- Package Consultation --------------------
@extend_schema(
    tags = ["Consultation_module"],
    summary="لیست مشاورانی که تایم 5 روز یا بیشتر (برای پکیج) در هفته را دارن",
    responses=ConsultantSerializer(many=True),
)
class PackageConsultantsView(generics.ListAPIView):
    serializer_class = ConsultantSerializer

    def get_queryset(self):
        consultants = Consultant.objects.all()
        return [c for c in consultants if c.times.filter(is_reserved=False).count() >= 5]


# -------------------- Reservation --------------------
@extend_schema(
    summary="Reserve consultation (FREE, SINGLE, PACKAGE)",
    tags=["Consultation_module"],
    request=ReservationSerializer,
    responses=ReservationSerializer,
)
class ReserveConsultationView(views.APIView):
    def post(self, request):
        serializer = ReservationSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        consultant = data["consultant"]
        res_type = data["type"]

        # 🚨 محدودیت: هر کاربر فقط یکبار جلسه رایگان
        if res_type == "FREE":
            if Reservation.objects.filter(user=request.user, type="FREE").exists():
                return Response(
                    {"detail": "شما قبلاً یک جلسه رایگان استفاده کرده‌اید."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # 🚨 برای مشاوره رایگان فقط یک تایم مجاز است
            if not data.get("times") or len(data.get("times")) != 1:
                return Response(
                    {"detail": "برای مشاوره رایگان باید دقیقاً یک زمان انتخاب کنید."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 🟢 ایجاد رزرو
        reservation = Reservation.objects.create(
            user=request.user,
            consultant=consultant,
            type=res_type,
        )

        # ✅ جلسه تک یا رایگان → استفاده از time_ids
        if res_type in ["SINGLE", "FREE"]:
            for t in data.get("times", []):
                if t.consultant != consultant or t.is_reserved:
                    return Response(
                        {"detail": "این زمان معتبر نیست یا قبلاً رزرو شده است."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                t.is_reserved = True
                t.save()
                reservation.times.add(t)

        # ✅ جلسه پکیج → ۵ تایم آزاد بعدی
        elif res_type == "PACKAGE":
            free_times = consultant.times.filter(is_reserved=False).order_by("start_time")[:5]
            if free_times.count() < 5:
                return Response(
                    {"detail": "این مشاور کمتر از ۵ زمان آزاد دارد."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            for t in free_times:
                t.is_reserved = True
                t.save()
                reservation.times.add(t)

        return Response(
            ReservationSerializer(reservation).data,
            status=status.HTTP_201_CREATED
        )


# -------------------- My Reservations --------------------
@extend_schema(
    tags = ["Consultation_module"],
    summary="لیست جلسات رزرو شده و تکمیل نشده کاربر",
    responses=ReservationSerializer(many=True),
)
class MyReservationsView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user).exclude(
            is_completed_by_user=True, is_completed_by_consultant=True
        )


@extend_schema(
    tags = ["Consultation_module"],
    summary="لیست جلسات تکمیل شده کاربر",
    responses=ReservationSerializer(many=True),
)
class MyCompletedReservationsView(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        return Reservation.objects.filter(
            user=self.request.user,
            is_completed_by_user=True,
            is_completed_by_consultant=True,
        )


# -------------------- Complete Reservation --------------------
@extend_schema(
    summary="اتمام مشاوره توسط کاربر",
    tags=["Consultation_module"],
    description="کاربر می‌تواند جلسه‌ای که رزرو کرده را به حالت انتظار برای اتمام بگذارد. بعد از تایید مشاور، جلسه به لیست اتمام‌شده منتقل می‌شود.",
    responses={200: ReservationSerializer},
)
class CompleteByUserView(views.APIView):
    permission_classes = [IsNormalUser]

    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, id=pk, user=request.user)
        reservation.is_completed_by_user = True
        reservation.save()
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


# ✅ اتمام جلسه توسط مشاور
@extend_schema(
    summary="اتمام مشاوره توسط مشاور",
    tags=["Consultant Times"],
    description="مشاور می‌تواند جلسه‌ای که دارد را به حالت اتمام بگذارد. بعد از تایید کاربر هم، جلسه به لیست اتمام‌شده منتقل می‌شود.",
    responses={200: ReservationSerializer},
)
class CompleteByConsultantView(views.APIView):
    permission_classes = [IsConsultant]

    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, id=pk, consultant__user=request.user)
        reservation.is_completed_by_consultant = True
        reservation.save()
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)

@extend_schema(
    summary="لیست تایم‌های آزاد یک مشاور",
    tags=["Consultant Times"],
    description="تمام تایم‌های آزاد (تاریخ و ساعت) یک مشاور برگردانده می‌شود.",
    responses=ConsultantManageTimeSerializer,
)
class ConsultantAvailableTimesView(generics.ListAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        consultant_id = self.kwargs["consultant_id"]
        return ConsultationTime.objects.filter(
            consultant_id=consultant_id, is_reserved=False
        ).order_by("start_time")

@extend_schema(
    tags=["Consultant Times"],
    description="مشاور می‌تواند تایم‌های آزاد خودش را مدیریت کند (افزودن، لیست کردن)."
)
class ConsultantTimeListCreateView(generics.ListCreateAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsConsultant]

    def get_queryset(self):
        return ConsultationTime.objects.filter(consultant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(consultant=self.request.user)


@extend_schema(
    tags=["Consultant Times"],
    description="ویرایش یا حذف تایم مشاور (فقط اگر حداقل ۷ روز تا جلسه مانده باشد)."
)
class ConsultantTimeUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConsultantManageTimeSerializer
    permission_classes = [IsConsultant]

    def get_queryset(self):
        return ConsultationTime.objects.filter(consultant=self.request.user)

    def perform_update(self, serializer):
        obj = self.get_object()
        if not obj.can_edit():
            raise PermissionError("شما فقط تا ۷ روز قبل از جلسه می‌توانید تغییر دهید.")
        serializer.save()

    def perform_destroy(self, instance):
        if not instance.can_edit():
            raise PermissionError("شما فقط تا ۷ روز قبل از جلسه می‌توانید حذف کنید.")
        instance.delete()

@extend_schema(
    summary="List consultants with available times for SINGLE sessions",
    tags=["Consultation_module"],
    responses=ConsultantWithTimesSerializer(many=True),
)
class SingleConsultantsWithTimesView(views.APIView):
    def get(self, request):
        consultants = Consultant.objects.filter(
            times__is_reserved=False
        ).distinct()

        # هر مشاور فقط تایم‌های آزادش رو نشون بدیم
        data = []
        for consultant in consultants:
            free_times = consultant.times.filter(is_reserved=False).order_by("start_time")
            data.append(
                ConsultantWithTimesSerializer(
                    consultant,
                    context={"times": free_times}
                ).data
            )

        return Response(data)
