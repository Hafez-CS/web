from django.contrib import admin
from .models import Consultation, FreeConsultationCoupon, ConsultantAvailableDate


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['user', 'consultant', 'consultation_type', 'scheduled_date', 'scheduled_time', 'status', 'session_number']
    list_filter = ['status', 'consultation_type', 'scheduled_date']
    search_fields = ['user__email', 'consultant__email', 'package_group']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    ordering = ['-scheduled_date', '-scheduled_time']


@admin.register(FreeConsultationCoupon)
class FreeConsultationCouponAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'used', 'created_at', 'used_at']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'code']
    readonly_fields = ['created_at', 'used_at']


@admin.register(ConsultantAvailableDate)
class ConsultantAvailableDateAdmin(admin.ModelAdmin):
    list_display = ['consultant', 'date', 'start_time', 'end_time', 'is_available']
    list_filter = ['is_available', 'date', 'consultant']
    search_fields = ['consultant__email', 'consultant__username']
    ordering = ['date', 'start_time']
    
    def get_queryset(self, request):
        """نمایش تایم‌های آینده به صورت پیش‌فرض"""
        qs = super().get_queryset(request)
        from django.utils import timezone
        return qs.filter(date__gte=timezone.now().date())