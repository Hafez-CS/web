from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)  # جلوی تغییر role گرفته شد

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'role', 'bio')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False


class UserCreateByAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'password', 'role', 'bio')
        read_only_fields = ('role',)  # چون role توی view مشخص میشه

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = UserProfile.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)  # اضافه شد

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'normal')  # اگه نفرستاد default = normal

        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role=role
        )
        return user

