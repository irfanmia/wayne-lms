from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import KidProfileViewSet, ParentProfileViewSet

router = DefaultRouter()
router.register('profiles', KidProfileViewSet, basename='kid-profile')
router.register('parents', ParentProfileViewSet, basename='parent-profile')

urlpatterns = [
    path('', include(router.urls)),
]
