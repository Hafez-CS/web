from django.urls import path
from .views import ConsultantListCreateView, ConsultantRetrieveUpdateOrDeleteView, SchoolAdminListCreateView, SchoolAdminRetrieveUpdateOrDeleteView

urlpatterns = [
    path('consultants/', ConsultantListCreateView.as_view(), name='consultant-list-create'),
    path("consultants/<int:pk>/", ConsultantRetrieveUpdateOrDeleteView.as_view(), name="consultant-detail"),

    # 🔹 مدیریت مدیر مجموعه
    path("school-admins/", SchoolAdminListCreateView.as_view(), name="schooladmin-list-create"),
    path("school-admins/<int:pk>/", SchoolAdminRetrieveUpdateOrDeleteView.as_view(), name="schooladmin-detail"),
]
