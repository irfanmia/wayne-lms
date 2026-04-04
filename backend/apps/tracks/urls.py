from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrackViewSet, ExerciseViewSet, ConceptListView

router = DefaultRouter()
router.register('', TrackViewSet, basename='track')

urlpatterns = [
    path('<slug:track_slug>/concepts/', ConceptListView.as_view(), name='track-concepts'),
    path('<slug:track_slug>/exercises/', ExerciseViewSet.as_view({'get': 'list'}), name='track-exercises'),
    path('<slug:track_slug>/exercises/<slug:slug>/', ExerciseViewSet.as_view({'get': 'retrieve'}), name='track-exercise-detail'),
    path('', include(router.urls)),
]
