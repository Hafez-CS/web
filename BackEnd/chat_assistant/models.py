from django.db import models
from accounts.models import UserProfile

# Create your models here.

class Chat(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="chats")
    slug = models.SlugField(unique=True, blank=True)
    content = models.JSONField(default=list)

    def save(self, *args, **kwargs):
        if not self.slug:
            chat_count = Chat.objects.filter(user=self.user).count() + 1
            self.slug = f"{self.user.username}-{chat_count}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.slug