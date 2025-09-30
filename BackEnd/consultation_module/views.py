import random, string
from rest_framework import generics, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

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
    tags = ["Consultation_module"],
    summary="رزرو جلسه مشاوره (تک جلسه ، پکیج ، جلسه یکبار مصرف رایگان)",
    request=ReservationCreateSerializer,
    responses=ReservationSerializer,
)
class ReserveConsultationView(views.APIView):
    def post(self, request):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        consultant = get_object_or_404(Consultant, id=data["consultant_id"])
        reservation = Reservation.objects.create(
            user=request.user, consultant=consultant, type=data["type"]
        )

        if data["type"] == "SINGLE":
            time = get_object_or_404(ConsultationTime, id=data["time_id"], consultant=consultant, is_reserved=False)
            time.is_reserved = True
            time.save()
            reservation.times.add(time)

        elif data["type"] == "PACKAGE":
            free_times = consultant.times.filter(is_reserved=False)[:5]
            for t in free_times:
                t.is_reserved = True
                t.save()
                reservation.times.add(t)

        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


# -------------------- My Reservations --------------------
@extend_schema(
    tags = ["Consultation_module"],
    summary="لیست جلسات رزرو شده و تکمیل نشده کاربر",
    responses=ReservationSerializer(many=True),
)
class MyReservationsView(generics.ListAPIView):
    serializer_class = ReservationSerializer

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

    def get_queryset(self):
        return Reservation.objects.filter(
            user=self.request.user,
            is_completed_by_user=True,
            is_completed_by_consultant=True,
        )


# -------------------- Complete Reservation --------------------
@extend_schema(
    tags = ["Consultation_module"],
    summary="اتمام جلسه مشاوره توسط کاربر",
    responses=ReservationSerializer,
)
class CompleteReservationView(views.APIView):
    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, id=pk, user=request.user)
        reservation.is_completed_by_user = True
        reservation.save()
        return Response(ReservationSerializer(reservation).data)
