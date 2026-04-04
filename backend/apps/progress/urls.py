from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet, ExerciseSubmissionViewSet, TrackProgressViewSet

router = DefaultRouter()
router.register('enrollments', EnrollmentViewSet, basename='enrollment')
router.register('submissions', ExerciseSubmissionViewSet, basename='submission')
router.register('track-progress', TrackProgressViewSet, basename='track-progress')
urlpatterns = router.urls
