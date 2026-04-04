from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ClassroomViewSet, JoinClassroomView, TeacherDashboardView

router = DefaultRouter()
router.register('', ClassroomViewSet, basename='classroom')

urlpatterns = [
    path('join/', JoinClassroomView.as_view(), name='join-classroom'),
    path('teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('', include(router.urls)),
]
