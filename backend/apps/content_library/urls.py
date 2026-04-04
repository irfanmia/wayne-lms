from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReusableLessonViewSet, ReusableQuizViewSet, ReusableQuizQuestionViewSet, ReusableAssignmentViewSet

router = DefaultRouter()
router.register('lessons', ReusableLessonViewSet)
router.register('quizzes', ReusableQuizViewSet)
router.register('quiz-questions', ReusableQuizQuestionViewSet)
router.register('assignments', ReusableAssignmentViewSet)

urlpatterns = [path('', include(router.urls))]
