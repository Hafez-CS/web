from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from .models import UserProfile
from .serializers import UserSerializer, RegisterSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from .serializers_docs import (
    LoginRequestSerializer, LoginResponseSerializer,
    LogoutRequestSerializer, GenericMessageSerializer
)
from rest_framework.exceptions import PermissionDenied


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="ورود کاربر",
        description="با ارسال ایمیل و رمز عبور توکن دسترسی و رفرش برمی‌گرداند.",
        request=LoginRequestSerializer,
        responses={
            200: OpenApiResponse(LoginResponseSerializer, description="ورود موفق"),
            400: OpenApiResponse(GenericMessageSerializer, description="ایمیل یا پسورد داده نشده"),
            401: OpenApiResponse(GenericMessageSerializer, description="اطلاعات ورود نادرست")
        },
        tags=["Auth-accounts_module"]
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({
                "detail": "ایمیل و رمز عبور الزامی است."
            }, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(email=email, password=password)
        if user is None:
            return Response({
                "detail": "ایمیل یا رمز عبور اشتباه است."
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

    @extend_schema(
        summary="ثبت‌نام کاربر",
        description="کاربر جدید را ایجاد می‌کند.",
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(RegisterSerializer, description="ثبت‌نام موفق"),
            400: OpenApiResponse(GenericMessageSerializer, description="خطای اعتبارسنجی")
        },
        tags=["Auth-accounts_module"]
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)

            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            role = serializer.validated_data.get('role', 'normal')  # نقش درخواستی

            # کنترل یونیک بودن username و email
            if UserProfile.objects.filter(username=username).exists():
                return Response({
                    "detail": "نام کاربری قبلاً ثبت شده است."
                }, status=status.HTTP_400_BAD_REQUEST)

            if UserProfile.objects.filter(email=email).exists():
                return Response({
                    "detail": "ایمیل قبلاً ثبت شده است."
                }, status=status.HTTP_400_BAD_REQUEST)

            # کنترل سطح دسترسی برای نقش‌ها
            if role == 'consultant' and not (
                request.user.is_authenticated and request.user.role == 'platform_admin'
            ):
                raise PermissionDenied("فقط مدیر پلتفرم می‌تواند مشاور ایجاد کند.")

            if role == 'platform_admin':
                raise PermissionDenied("امکان ایجاد مدیر پلتفرم وجود ندارد.")

            # ذخیره‌سازی
            self.perform_create(serializer)

            return Response({
                "success": True,
                "message": "ثبت‌نام با موفقیت انجام شد.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({
                "detail": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        except PermissionDenied as e:
            return Response({
                "detail": str(e)
            }, status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            return Response({
                "detail": f"خطایی رخ داد: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="نمایش پروفایل",
        description="اطلاعات پروفایل کاربر لاگین‌شده را نمایش می‌دهد.",
        responses={200: UserSerializer},
        tags=["User-accounts_module"]
    )
    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="ویرایش پروفایل",
        description="پروفایل کاربر لاگین‌شده را بروزرسانی می‌کند.",
        request=UserSerializer,
        responses={200: UserSerializer},
        tags=["User-accounts_module"]
    )
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            user, data=request.data, partial=True
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
                "detail": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "detail": f"خطایی رخ داد: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="حذف حساب کاربری",
        description="اکانت کاربر فعلی را حذف می‌کند.",
        responses={204: None, 401: GenericMessageSerializer},
        tags=["User-accounts_module"]
    )
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "اکانت شما با موفقیت حذف گردید"}, status=status.HTTP_204_NO_CONTENT)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="خروج کاربر",
        description="رفرش توکن کاربر را بلاک می‌کند و عملاً او را خارج می‌نماید.",
        request=LogoutRequestSerializer,
        responses={
            200: GenericMessageSerializer,
            400: GenericMessageSerializer
        },
        tags=["Auth-accounts_module"]
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "رفرش توکن ارسال نشده است."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "خروج با موفقیت انجام شد."}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({"detail": "توکن نامعتبر است یا قبلاً بلاک شده است."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"خطا: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
