from django.db import models
from accounts.models import UserProfile
from django.utils.text import slugify
import uuid

class Exam(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    questions = models.JSONField(default=list)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="exams", null=True, blank=True)
    answers = models.JSONField(null=True, blank=True)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.user:
            return f"{self.title} - {self.user.username} - ({self.score})"
        return f"{self.title} (Template)"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or f"exam-{self.id or uuid.uuid4()}"
            slug = base_slug
            counter = 1
            while Exam.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
        ]