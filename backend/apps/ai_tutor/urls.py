from django.urls import path
from . import views

urlpatterns = [
    path('settings/', views.AITutorSettingsView.as_view(), name='ai-tutor-settings'),
    path('chat/', views.AITutorChatView.as_view(), name='ai-tutor-chat'),
    path('conversations/', views.AITutorConversationView.as_view(), name='ai-tutor-conversations'),
    path('suggested-prompts/', views.AITutorSuggestedPromptsView.as_view(), name='ai-tutor-suggested-prompts'),
]
