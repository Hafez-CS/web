from django.db import models
from django.conf import settings

class Idea(models.Model):
    IDEA_TYPE_CHOICES = (
        ('physical', 'فیزیکی'),
        ('platform', 'پلتفرمی'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ideas')
    idea_name = models.CharField(max_length=200, verbose_name='نام ایده')
    idea_description = models.TextField(verbose_name='شرح کامل درباره ایده')
    is_implemented = models.BooleanField(default=False, verbose_name='آیا ایده را اجرایی کردی')
    idea_type = models.CharField(max_length=20, choices=IDEA_TYPE_CHOICES, verbose_name='نوع ایده')
    physical_description = models.TextField(blank=True, null=True, verbose_name='شرح فیزیک محصول')
    generated_image = models.TextField(blank=True, null=True, verbose_name='تصویر تولید شده')
    chat_room_slug = models.CharField(max_length=120, blank=True, null=True, verbose_name='شناسه اتاق چت')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'ایده'
        verbose_name_plural = 'ایده‌ها'

    def __str__(self):
        return f"{self.idea_name} - {self.user.email}"
