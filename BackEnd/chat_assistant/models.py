from django.db import models
from accounts.models import UserProfile

# Create your models here.

class Chat(models.Model):
    """
    
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='chat')
    content = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MainChat - {self.user.email}"
    
class ChatRoom(models.Model):
    """
    
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='chat_rooms')
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='rooms')
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    name = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def _generate_slug(self):
        base = f"{self.user.username}-{ChatRoom.objects.filter(user=self.user).count()+1}"
        slug = base
        i = 1
        while ChatRoom.objects.filter(slug=slug).exists():
            i += 1
            slug = f"{base}-{i}"
        return slug
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.slug}"
