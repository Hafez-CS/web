from django.urls import path
from .views import SendMessageView, ChatHistoryView

urlpatterns = [
    path('chat-history/', ChatHistoryView.as_view(), name='chat-history'),
    path('send-message/', SendMessageView.as_view(), name='send-message')
]