from django.conf import settings
from openai import OpenAI
from .data import EXAMS

def get_exam_by_slug(slug):
    for exam in EXAMS:
        if exam["slug"] == slug:
            return exam
    return None

def send_exam_to_ai(payload: dict):
    user = payload.get("user")
    slug = payload.get("slug")
    title = payload.get("title")
    score = payload.get("score", 0)
    
    # گرفتن تعداد سوالات از data.py
    exam = get_exam_by_slug(slug)
    total_questions = len(exam["questions"]) if exam else 2  # مقدار پیش‌فرض 2 اگه آزمون پیدا نشد

    prompt = (
        f"کاربر با ایمیل '{user}' در آزمون '{title}' (شناسه: {slug}) شرکت کرده و {score} از {total_questions} امتیاز گرفته. "
        f"یه پیام کوتاه و دوستانه به فارسی بنویس که به کاربر بگه نتایج آزمونش آماده است و می‌تونه برای تحلیل بیشتر به چت مراجعه کنه."
    )

    client = OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "تو یک دستیار دوستانه هستی که پیام‌های کوتاه و واضح به فارسی می‌نویسی."},
                {"role": "user", "content": prompt}
            ],
            stream=False,
            temperature=0.7,
            max_tokens=100
        )
        feedback = response.choices[0].message.content
    except Exception as e:
        feedback = f"خطا در ارتباط با AI: {str(e)}"

    return {
        "feedback": feedback,
        "difficulty": "easy",
        "next_step": "تمرین بیشتر"
    }