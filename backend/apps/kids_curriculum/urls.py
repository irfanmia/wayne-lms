from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import KidCourseViewSet, KidChallengeViewSet

router = DefaultRouter()
router.register('courses', KidCourseViewSet, basename='kid-course')
router.register('challenges', KidChallengeViewSet, basename='kid-challenge')

urlpatterns = [
    path('', include(router.urls)),
]
