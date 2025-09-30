# serializers_docs.py (مثلاً یک فایل جدا برای schema کمک کننده)
from rest_framework import serializers

class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class LoginResponseUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()

class LoginResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = serializers.DictField()  # ساده، میشه ریز هم کرد

class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class GenericMessageSerializer(serializers.Serializer):
    detail = serializers.CharField()
