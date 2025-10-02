from django.db import models
from accounts.models import UserProfile
from django.utils import timezone

# Create your models here.

class Consultant(models.Model):
    user = models.OneToOneField(
        UserProfile,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "consultant"},
        related_name="consultant_profile"  # 👈 پیشنهاد اضافه کردن related_name
    )
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username


class ConsultationTime(models.Model):
    consultant = models.ForeignKey(
        Consultant,
        on_delete=models.CASCADE,
        related_name="times"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_reserved = models.BooleanField(default=False)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_time <= self.start_time:
            raise ValidationError("end_time باید بعد از start_time باشد.")

    def can_edit(self):
        """مشاور فقط تا یک هفته قبل از شروع جلسه می‌تواند تغییر دهد یا حذف کند"""
        return (self.start_time - timezone.now()).days >= 7

    class Meta:
        indexes = [
            models.Index(fields=["consultant", "start_time"]),
        ]
        ordering = ["start_time"]  # 👈 مرتب‌سازی پیش‌فرض



class Reservation(models.Model):
    TYPE_CHOICES = (
        ("FREE", "Free"),
        ("SINGLE", "Single"),
        ("PACKAGE", "Package"),
    )
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
    )

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    consultant = models.ForeignKey(
        Consultant,
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    times = models.ManyToManyField(
        ConsultationTime,
        related_name="reservations",
        blank=True  # 👈 بهتره رزرو ساخته بشه حتی قبل از انتخاب تایم
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    is_completed_by_user = models.BooleanField(default=False)
    is_completed_by_consultant = models.BooleanField(default=False)

    def is_fully_completed(self):
        return self.is_completed_by_user and self.is_completed_by_consultant

    def __str__(self):
        return f"Reservation: {self.user.username} → {self.consultant.user.username} ({self.type})"

