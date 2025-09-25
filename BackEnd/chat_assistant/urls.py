from django.urls import path
from .views import SendMessageView, ChatHistoryView, NewChatRoomView, ListChatRoomsView, ChatContentView, SendAiForSummary

urlpatterns = [
    path("new-room/", NewChatRoomView.as_view(), name="new_chat_room"),
    path("rooms/", ListChatRoomsView.as_view(), name="list_chat_rooms"),
    path("<slug:slug>/send-message/", SendMessageView.as_view(), name="send_message"),
    path("<slug:slug>/chat-history/", ChatHistoryView.as_view(), name="chat_history"),
    path("all-chats/", ChatContentView.as_view(), name="all_chats"),
    path("<slug:slug>/summary/", SendAiForSummary.as_view(), name="chat_summary"),
]