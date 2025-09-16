from django.urls import path
from .views import ExamDetailView

urlpatterns = [
    path('<str:title>/', ExamDetailView.as_view(), name='exam-detail'),
]