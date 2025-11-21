from django.urls import path
from .views import (
    CreateIdeaView, ListUserIdeasView, IdeaDetailView,
    AdminListAllIdeasView, AdminIdeaDetailView
)

urlpatterns = [
    path('create/', CreateIdeaView.as_view(), name='create_idea'),
    path('my-ideas/', ListUserIdeasView.as_view(), name='list_user_ideas'),
    path('my-ideas/<int:id>/', IdeaDetailView.as_view(), name='idea_detail'),
    path('admin/all-ideas/', AdminListAllIdeasView.as_view(), name='admin_list_all_ideas'),
    path('admin/ideas/<int:id>/', AdminIdeaDetailView.as_view(), name='admin_idea_detail'),
]
