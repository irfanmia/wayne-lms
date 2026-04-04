from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailTemplateViewSet, EmailLogViewSet, BulkEmailViewSet

router = DefaultRouter()
router.register('templates', EmailTemplateViewSet)
router.register('logs', EmailLogViewSet)
router.register('bulk', BulkEmailViewSet)

urlpatterns = [path('', include(router.urls))]
