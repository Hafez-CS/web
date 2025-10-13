from django.urls import path
from .views import SchoolAdminUsersView, SchoolAdminReportsView

urlpatterns = [
    path('users/', SchoolAdminUsersView.as_view(), name='schooladmin-users'),
    path('reports/', SchoolAdminReportsView.as_view(), name='schooladmin-reports'),
]