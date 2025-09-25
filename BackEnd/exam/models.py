from django.db import models
from accounts.models import UserProfile

class Exam(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="exams")
    slug = models.SlugField()
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.title} - {self.score}"