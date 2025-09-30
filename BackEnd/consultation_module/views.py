import random, string
from rest_framework import generics, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from accounts.permissions import IsConsultant, IsNormalUser

from .models import Consultant, ConsultationTime, Reservation
from .serializers import (
    ConsultantSerializer,
    ConsultationTimeSerializer,
    ReservationSerializer,
    ReservationCreateSerializer,
    FreeConsultationCodeSerializer,
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
    responses=ConsultationTimeSerializer(many=True),
)
class SingleConsultationTimesView(generics.ListAPIView):
    serializer_class = ConsultationTimeSerializer
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
    request=ReservationCreateSerializer,
    responses=ReservationSerializer,
)
class ReserveConsultationView(views.APIView):
    def post(self, request):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        consultant = get_object_or_404(Consultant, id=data["consultant_id"])

        # 🚨 محدودیت: هر کاربر فقط یکبار جلسه رایگان
        if data["type"] == "FREE":
            if Reservation.objects.filter(user=request.user, type="FREE").exists():
                return Response(
                    {"detail": "شما قبلاً یک جلسه رایگان استفاده کرده‌اید."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # 🚨 فقط تک جلسه‌ای مجاز است
            if "time_id" not in data:
                return Response(
                    {"detail": "برای مشاوره رایگان باید یک زمان مشخص کنید."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reservation = Reservation.objects.create(
            user=request.user, consultant=consultant, type=data["type"]
        )

        # ✅ جلسه تک یا رایگان
        if data["type"] in ["SINGLE", "FREE"]:
            time = get_object_or_404(
                ConsultationTime,
                id=data["time_id"],
                consultant=consultant,
                is_reserved=False,
            )
            time.is_reserved = True
            time.save()
            reservation.times.add(time)

        # ✅ جلسه پکیج (۵ جلسه پشت سر هم)
        elif data["type"] == "PACKAGE":
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
            ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED
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
    tags=["Consultation_module"],
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
    tags=["Consultation_module"],
    description="تمام تایم‌های آزاد (تاریخ و ساعت) یک مشاور برگردانده می‌شود.",
    responses=ConsultationTimeSerializer,
)
class ConsultantAvailableTimesView(generics.ListAPIView):
    serializer_class = ConsultationTimeSerializer
    permission_classes = [IsNormalUser]

    def get_queryset(self):
        consultant_id = self.kwargs["consultant_id"]
        return ConsultationTime.objects.filter(
            consultant_id=consultant_id, is_reserved=False
        ).order_by("start_time")
