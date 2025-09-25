from django.conf import settings
from openai import OpenAI

def send_to_ai(messages, system_prompt="تو یک دستیار باهوش و دوستانه هستی که پاسخ‌های کوتاه و دقیق به فارسی می‌دی."):
    client = OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )
    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            stream=False,
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"خطا در ارتباط با AI: {str(e)}"