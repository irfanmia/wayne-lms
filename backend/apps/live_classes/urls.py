from rest_framework.routers import DefaultRouter
from .views import LiveClassViewSet

router = DefaultRouter()
router.register('', LiveClassViewSet, basename='live-classes')

urlpatterns = router.urls
