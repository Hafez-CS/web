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

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
