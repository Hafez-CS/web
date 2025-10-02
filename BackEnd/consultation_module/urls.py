from django.urls import path
from .views import (
    FreeConsultationCodeView,
    SingleConsultationTimesView,
    PackageConsultantsView,
    ReserveConsultationView,
    MyReservationsView,
    MyCompletedReservationsView,
    CompleteByUserView,
    CompleteByConsultantView,
    ConsultantAvailableTimesView,
    ConsultantTimeListCreateView,
    ConsultantTimeUpdateDeleteView,
    SingleConsultantsWithTimesView
)

urlpatterns = [
    path("free-code/", FreeConsultationCodeView.as_view(), name="free-consultation-code"),
    path("single-times/", SingleConsultationTimesView.as_view(), name="single-times"),
    path("consultant/<int:consultant_id>/times/", ConsultantAvailableTimesView.as_view(), name="consultant-available-times"),
    path("package-consultants/", PackageConsultantsView.as_view(), name="package-consultants"),
    path("reserve/", ReserveConsultationView.as_view(), name="reserve-consultation"),
    path("my-reservations/", MyReservationsView.as_view(), name="my-reservations"),
    path("my-completed/", MyCompletedReservationsView.as_view(), name="my-completed"),
    path("complete/<int:pk>/", CompleteByUserView.as_view(), name="complete-by-user"),
    path("complete-by-consultant/<int:pk>/", CompleteByConsultantView.as_view(), name="complete-by-consultant"),
    path("consultant/times/", ConsultantTimeListCreateView.as_view(), name="consultant-time-list-create"),
    path("consultant/times/<int:pk>/", ConsultantTimeUpdateDeleteView.as_view(), name="consultant-time-update-delete"),
    path("single-consultants/", SingleConsultantsWithTimesView.as_view(),name="single-consultants-with-times",
),
]
