from django.urls import path
from .views import (
    FreeConsultationCodeView,
    SingleConsultationTimesView,
    PackageConsultantsView,
    ReserveConsultationView,
    MyReservationsView,
    MyCompletedReservationsView,
    CompleteReservationView,
)

urlpatterns = [
    path("consultations/free-code/", FreeConsultationCodeView.as_view()),
    path("consultations/single-times/", SingleConsultationTimesView.as_view()),
    path("consultations/package-consultants/", PackageConsultantsView.as_view()),
    path("consultations/reserve/", ReserveConsultationView.as_view()),
    path("consultations/my-reservations/", MyReservationsView.as_view()),
    path("consultations/my-completed/", MyCompletedReservationsView.as_view()),
    path("consultations/complete/<int:pk>/", CompleteReservationView.as_view()),
]
