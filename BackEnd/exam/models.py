# exam/models.py
from django.db import models
from accounts.models import UserProfile

class Exam(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="exams")
    title = models.CharField(max_length=255)
    score = models.IntegerField(default=0)
    answers = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username} - ({self.score})"

    class Meta:
        unique_together = ('user', 'title')