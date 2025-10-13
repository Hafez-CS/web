from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime


class ConsultationType(models.TextChoices):
    SINGLE = 'single', 'تک جلسه‌ای'
    PACKAGE = 'package', 'پکیج (۵ جلسه)'


class ConsultationStatus(models.TextChoices):
    PENDING = 'pending', 'در انتظار'
    CONFIRMED = 'confirmed', 'تأیید شده'
    COMPLETED = 'completed', 'تمام شده'
    CANCELLED = 'cancelled', 'لغو شده'


class ConsultantAvailableDate(models.Model):
    """تایم‌های خاص مشاور بر اساس تاریخ - سیستم تقویم"""
    consultant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='available_dates',
        limit_choices_to={'role': 'consultant'}
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['consultant', 'date', 'start_time']
        ordering = ['date', 'start_time']
        indexes = [
            models.Index(fields=['consultant', 'is_available', 'date']),
        ]
        verbose_name = 'تاریخ آزاد مشاور'
        verbose_name_plural = 'تاریخ‌های آزاد مشاوران'

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("زمان پایان باید بعد از زمان شروع باشد")
        
        if self.date < timezone.now().date():
            raise ValidationError("نمی‌توانید برای گذشته تایم تعریف کنید")

    def is_booked(self):
        """بررسی آیا این تایم رزرو شده است"""
        return Consultation.objects.filter(
            consultant=self.consultant,
            scheduled_date=self.date,
            scheduled_time__gte=self.start_time,
            scheduled_time__lt=self.end_time,
            status__in=[ConsultationStatus.PENDING, ConsultationStatus.CONFIRMED]
        ).exists()

    def can_be_modified(self):
        """بررسی اینکه آیا این تایم قابل تغییر است (فقط جمعه‌ها و فقط اگر رزرو نشده باشد)"""
        today = timezone.now().date()
        is_friday = today.weekday() == 4  # 4 = Friday
        return is_friday and not self.is_booked()

    def __str__(self):
        consultant_name = self.consultant.get_full_name() or self.consultant.username
        return f"{consultant_name} - {self.date} ({self.start_time}-{self.end_time})"


class Consultation(models.Model):
    """رزرو مشاوره"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultations',
        limit_choices_to={'role': 'normal'}
    )
    consultant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultant_sessions',
        limit_choices_to={'role': 'consultant'}
    )
    consultation_type = models.CharField(
        max_length=10,
        choices=ConsultationType.choices,
        default=ConsultationType.SINGLE
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    status = models.CharField(
        max_length=10,
        choices=ConsultationStatus.choices,
        default=ConsultationStatus.CONFIRMED
    )
    package_group = models.CharField(max_length=100, null=True, blank=True)
    session_number = models.IntegerField(default=1)
    
    # ردیابی تکمیل
    user_completed = models.BooleanField(default=False)
    consultant_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # کد تخفیف
    discount_code = models.CharField(max_length=50, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date', '-scheduled_time']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['consultant', 'status']),
            models.Index(fields=['package_group']),
            models.Index(fields=['scheduled_date', 'scheduled_time']),
        ]
        verbose_name = 'مشاوره'
        verbose_name_plural = 'مشاوره‌ها'

    def mark_completed_by_user(self):
        self.user_completed = True
        self._check_completion()
        self.save()

    def mark_completed_by_consultant(self):
        self.consultant_completed = True
        self._check_completion()
        self.save()
        
    def _check_completion(self):
        if self.user_completed and self.consultant_completed and not self.completed_at:
            self.status = ConsultationStatus.COMPLETED
            self.completed_at = timezone.now()

    def __str__(self):
        user_name = self.user.get_full_name() or self.user.username
        consultant_name = self.consultant.get_full_name() or self.consultant.username
        return f"{user_name} با {consultant_name} در {self.scheduled_date}"


class FreeConsultationCoupon(models.Model):
    """کوپن مشاوره رایگان یکبار مصرف"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='free_coupon'
    )
    code = models.CharField(max_length=50, unique=True)
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'کوپن رایگان'
        verbose_name_plural = 'کوپن‌های رایگان'

    def use_coupon(self):
        if self.used:
            raise ValidationError("کوپن قبلاً استفاده شده است")
        self.used = True
        self.used_at = timezone.now()
        self.save()

    def __str__(self):
        user_name = self.user.get_full_name() or self.user.username
        return f"{user_name} - {self.code}"


# DEPRECATED: This model is no longer used - keeping for migration compatibility
class ConsultantSchedule(models.Model):
    """زمان‌بندی مشاور - DEPRECATED: استفاده نشود، از ConsultantAvailableDate استفاده کنید"""
    consultant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedules',
        limit_choices_to={'role': 'consultant'}
    )
    day_of_week = models.IntegerField(
        choices=[(i, ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'][i]) for i in range(7)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['consultant', 'day_of_week', 'start_time']
        ordering = ['day_of_week', 'start_time']
        verbose_name = 'زمان‌بندی مشاور (قدیمی)'
        verbose_name_plural = 'زمان‌بندی‌های مشاوران (قدیمی)'

    def __str__(self):
        days = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه']
        return f"{self.consultant.get_full_name() or self.consultant.username} - {days[self.day_of_week]}: {self.start_time}-{self.end_time}"