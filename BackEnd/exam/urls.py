from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.ListExamsView.as_view(), name='list-exams'),
    path('<slug:slug>/start/', views.StartExamView.as_view(), name='start-exam'),
    path('<slug:slug>/submit/', views.SubmitExamView.as_view(), name='submit-exam')
]
