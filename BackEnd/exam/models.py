from django.db import models
from accounts.models import UserProfile

class Exam(models.Model):
    title = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    correct_answer = models.CharField(max_length=100)
    options = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.exam.title} - {self.question_text[:50]}"

class UserAnswer(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - Q{self.question.id}: {self.answer}"

    class Meta:
        unique_together = ['user', 'exam', 'question']

class UserScore(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    ai_response = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.exam.title}: {self.score}"

    class Meta:
        unique_together = ['user', 'exam']