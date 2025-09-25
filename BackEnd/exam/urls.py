from django.urls import path
from . import views

urlpatterns = [
    path('<str:slug>/', views.ExamView.as_view(), name='exam'),
]