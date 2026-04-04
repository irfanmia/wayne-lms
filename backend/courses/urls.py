from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, CourseViewSet, MyEnrollmentsView

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('courses', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
]
