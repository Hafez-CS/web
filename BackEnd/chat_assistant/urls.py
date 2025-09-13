from django.urls import path
from .views import SendMessageView, ChatHistoryView, NewChatView

urlpatterns = [
    path("new/", NewChatView.as_view(), name="new_chat"),
    path("<str:username>/<int:chat_id>/send-message/", SendMessageView.as_view(), name="send_message"),
    path("<str:username>/<int:chat_id>/chat-history/", ChatHistoryView.as_view(), name="chat_history"),
]
