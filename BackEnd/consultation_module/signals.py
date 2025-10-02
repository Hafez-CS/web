from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import UserProfile
from .models import Consultant

@receiver(post_save, sender=UserProfile)
def create_consultant_profile(sender, instance, created, **kwargs):
    if instance.role == "consultant":
        Consultant.objects.get_or_create(user=instance)