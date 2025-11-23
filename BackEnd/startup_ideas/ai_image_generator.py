from urllib.parse import quote
from django.conf import settings

def generate_image_from_description(description):
    """
    Generate image using Pollinations.ai free API
    Returns image URL
    """
    try:
        clean_description = quote(description)
        image_url = f"https://image.pollinations.ai/prompt/{clean_description}?width=800&height=600&nologo=true"
        return image_url
    except Exception as e:
        return None

def get_default_platform_image():
    """
    Return default image URL for platform ideas
    """
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
