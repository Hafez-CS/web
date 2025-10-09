from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConsultantAvailableDateViewSet,
    ConsultationViewSet,
    FreeConsultationCouponViewSet,
)

router = DefaultRouter()

# Calendar-based system: Consultants manage specific dates
router.register('calendar', ConsultantAvailableDateViewSet, basename='calendar')

# Consultations management
router.register('consultations', ConsultationViewSet, basename='consultation')

# Free consultation coupons
router.register('coupons', FreeConsultationCouponViewSet, basename='coupon')

urlpatterns = [
    path('', include(router.urls)),
]