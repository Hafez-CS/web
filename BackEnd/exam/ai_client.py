from django.conf import settings
from openai import OpenAI

def send_exam_to_ai(payload: dict):
    user = payload.get("user")
    exam_id = payload.get("exam_id")
    title = payload.get("title")
    score = payload.get("score", 0)
    total_questions = 2

    prompt = (
        f"کاربر با ایمیل '{user}' در آزمون '{title}' (شناسه: {exam_id}) شرکت کرده و {score} از {total_questions} امتیاز گرفته. "
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
