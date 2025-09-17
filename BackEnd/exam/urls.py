from django.urls import path
from .views import ExamStartView, ExamSubmitView

urlpatterns = [
    path('start/', ExamStartView.as_view(), name='exam-start'),
    path('submit/', ExamSubmitView.as_view(), name='exam-submit'),
]
