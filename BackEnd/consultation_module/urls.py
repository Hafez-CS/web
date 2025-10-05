from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConsultantScheduleViewSet,
    ConsultationViewSet,
    FreeConsultationCouponViewSet,
    ConsultantAvailableDateViewSet
)

router = DefaultRouter()
router.register('schedules', ConsultantScheduleViewSet, basename='schedule')
router.register('available-dates', ConsultantAvailableDateViewSet, basename='available-date')
router.register('consultations', ConsultationViewSet, basename='consultation')
router.register('coupons', FreeConsultationCouponViewSet, basename='coupon')

urlpatterns = [
    path('', include(router.urls)),
]