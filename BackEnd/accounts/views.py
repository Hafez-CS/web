from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UserProfile
from .serializers import UserSerializer, RegisterSerializer


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({
                "success": False,
                "message": "ایمیل و رمز عبور الزامی است."
            }, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(email=email, password=password)
        if user is None:
            return Response({
                "success": False,
                "message": "ایمیل یا رمز عبور اشتباه است."
            }, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "message": "ورود با موفقیت انجام شد.",
            "data": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }
        }, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = UserProfile.objects.all()
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            if UserProfile.objects.filter(username=username).exists():
                return Response({
                    "success": False,
                    "message": "نام کاربری قبلاً ثبت شده است."
                }, status=status.HTTP_400_BAD_REQUEST)
            if UserProfile.objects.filter(email=email).exists():
                return Response({
                    "success": False,
                    "message": "ایمیل قبلاً ثبت شده است."
                }, status=status.HTTP_400_BAD_REQUEST)
            self.perform_create(serializer)
            return Response({
                "success": True,
                "message": "ثبت‌نام با موفقیت انجام شد.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({
                "success": False,
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"خطایی رخ داد: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # یوزر لاگین شده بر اساس توکن
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            user, data=request.data, partial=True  # 🔑 فقط فیلدهای داده‌شده آپدیت میشن
        )
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({
                "success": True,
                "message": "پروفایل با موفقیت بروزرسانی شد",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                "success": False,
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"خطایی رخ داد: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "اکانت شما با موفقیت حذف گردید"}, status=status.HTTP_204_NO_CONTENT)