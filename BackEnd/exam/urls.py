from django.urls import path
from .views import ExamView

urlpatterns = [
    path('<str:title>/', ExamView.as_view(), name='exam'),
]