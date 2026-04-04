from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import KidProgressViewSet, KidDashboardView

router = DefaultRouter()
router.register('', KidProgressViewSet, basename='kid-progress')

urlpatterns = [
    path('dashboard/', KidDashboardView.as_view(), name='kid-dashboard'),
    path('', include(router.urls)),
]
