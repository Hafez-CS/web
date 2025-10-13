from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import UserProfile
from accounts.serializers import UserSerializer
from accounts.permissions import IsSchoolAdmin
from drf_spectacular.utils import extend_schema


@extend_schema(
    tags=["SchoolAdmin-Users"],
    summary="لیست کاربران مربوط به مدیر مجموعه",
    description="نمایش کاربرانی که به این مدیر مجموعه تعلق دارند"
)
class SchoolAdminUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsSchoolAdmin]

    def get_queryset(self):
        """فقط کاربرانی که organization آنها برابر با مدیر فعلی است"""
        return UserProfile.objects.filter(
            role='normal',
            organization=self.request.user
        )


@extend_schema(
    tags=["SchoolAdmin-Reports"],
    summary="گزارش آماری مدیر مجموعه",
    description="تعداد کاربران مرتبط با این مدیر مجموعه"
)
class SchoolAdminReportsView(APIView):
    permission_classes = [IsSchoolAdmin]

    def get(self, request):
        """گزارش تعداد کاربران مرتبط"""
        user_count = UserProfile.objects.filter(
            role='normal',
            organization=request.user
        ).count()
        
        return Response({
            'total_users': user_count,
            'organization_manager': {
                'id': request.user.id,
                'name': request.user.get_full_name() or request.user.username,
                'email': request.user.email
            }
        }, status=status.HTTP_200_OK)