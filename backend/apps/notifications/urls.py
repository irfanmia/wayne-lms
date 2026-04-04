from django.urls import path
from .views import EmailTemplateListView, EmailTemplateDetailView, NotificationLogView

urlpatterns = [
    path('templates/', EmailTemplateListView.as_view()),
    path('templates/<int:pk>/', EmailTemplateDetailView.as_view()),
    path('log/', NotificationLogView.as_view()),
]
