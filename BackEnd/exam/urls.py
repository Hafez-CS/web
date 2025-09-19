# exam/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('<str:title>/', views.ExamView.as_view(), name='exam'),
]