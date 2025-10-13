from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class UserProfile(AbstractUser):
    ROLE_CHOICES = (
        ('normal', 'کاربر عادی'),
        ('consultant', 'مشاور'),
        ('platform_admin', 'مدیر پلتفرم'),
        ('school_admin', 'مدیر مجموعه'),
    )

    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='normal')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_full_name(self):
        """Returns first_name + last_name or empty string"""
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.email

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
