from django.urls import path
from .views import (
    ConsultantListCreateView,
    ConsultantRetrieveUpdateOrDeleteView,
    UserListCreateView,
    UserRetrieveUpdateOrDeleteView,
    SchoolAdminListCreateView,
    SchoolAdminRetrieveUpdateOrDeleteView,
    PlatformReportsView
)

urlpatterns = [
    # Consultants Management
    path('consultants/', ConsultantListCreateView.as_view(), name='consultant-list-create'),
    path('consultants/<int:pk>/', ConsultantRetrieveUpdateOrDeleteView.as_view(), name='consultant-detail'),

    # Users Management
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateOrDeleteView.as_view(), name='user-detail'),

    # School Admins (Organization Managers) Management
    path('school-admins/', SchoolAdminListCreateView.as_view(), name='schooladmin-list-create'),
    path('school-admins/<int:pk>/', SchoolAdminRetrieveUpdateOrDeleteView.as_view(), name='schooladmin-detail'),

    # Reports & Statistics
    path('reports/', PlatformReportsView.as_view(), name='platform-reports'),
]