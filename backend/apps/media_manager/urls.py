from django.urls import path
from .views import MediaListView, MediaUploadView, MediaDeleteView

urlpatterns = [
    path('', MediaListView.as_view()),
    path('upload/', MediaUploadView.as_view()),
    path('<int:pk>/', MediaDeleteView.as_view()),
]
