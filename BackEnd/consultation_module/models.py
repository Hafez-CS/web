from django.db import models
from accounts.models import UserProfile
from django.utils import timezone

# Create your models here.

class Consultant(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username
    
class ConsultationTime(models.Model):
    consultant = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="available_times")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_reserved = models.BooleanField(default=False)

    def can_edit(self):
        """مشاور فقط تا یک هفته قبل از شروع جلسه می‌تواند تغییر دهد یا حذف کند"""
        return (self.start_time - timezone.now()).days >= 7


class Reservation(models.Model):
    TYPE_CHOICES = (
        ("FREE", "Free"),
        ("SINGLE", "Single"),
        ("PACKAGE", "Package"),
    )

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="reservations")
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name="reservations")
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    times = models.ManyToManyField(ConsultationTime, related_name="reservations")
    created_at = models.DateTimeField(auto_now_add=True)

    # وضعیت پایان
    is_completed_by_user = models.BooleanField(default=False)
    is_completed_by_consultant = models.BooleanField(default=False)

    def is_fully_completed(self):
        return self.is_completed_by_user and self.is_completed_by_consultant

    def __str__(self):
        return f"Reservation: {self.user} → {self.consultant} ({self.type})"
