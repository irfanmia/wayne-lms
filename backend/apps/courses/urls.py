from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (CourseViewSet, LessonViewSet, QuizViewSet,
                    WishlistToggleView, WishlistListView, PublicQuizView,
                    CourseInstructorsView, DripScheduleViewSet, CourseFAQViewSet, CourseNoticeViewSet)
from .practice_views import (
    practice_overview, concept_map, exercise_list, exercise_detail,
    exercise_submit, practice_progress, practice_badges,
)

router = DefaultRouter()
router.register('drip-schedules', DripScheduleViewSet, basename='drip-schedule')
router.register('faqs', CourseFAQViewSet, basename='course-faq')
router.register('notices', CourseNoticeViewSet, basename='course-notice')
router.register('', CourseViewSet, basename='course')

urlpatterns = [
    path('lessons/<int:pk>/', LessonViewSet.as_view({'get': 'retrieve'})),
    path('lessons/<int:pk>/complete/', LessonViewSet.as_view({'post': 'complete'})),
    path('lessons/<int:pk>/comments/', LessonViewSet.as_view({'get': 'comments', 'post': 'comments'})),
    path('quizzes/<int:pk>/', QuizViewSet.as_view({'get': 'retrieve'})),
    path('quizzes/<int:pk>/submit/', QuizViewSet.as_view({'post': 'submit'})),
    path('quizzes/<int:pk>/results/', QuizViewSet.as_view({'get': 'results'})),
    path('quizzes/public/<slug:slug>/', PublicQuizView.as_view()),
    path('wishlist/', WishlistListView.as_view()),
    path('wishlist/toggle/', WishlistToggleView.as_view()),
    # Practice mode endpoints
    path('<slug:slug>/practice/', practice_overview, name='practice-overview'),
    path('<slug:slug>/practice/concept-map/', concept_map, name='concept-map'),
    path('<slug:slug>/practice/exercises/', exercise_list, name='practice-exercises'),
    path('<slug:slug>/practice/exercises/<slug:exercise_slug>/', exercise_detail, name='practice-exercise-detail'),
    path('<slug:slug>/practice/exercises/<slug:exercise_slug>/submit/', exercise_submit, name='practice-exercise-submit'),
    path('<slug:slug>/practice/progress/', practice_progress, name='practice-progress'),
    path('<slug:slug>/practice/badges/', practice_badges, name='practice-badges'),
    path('', include(router.urls)),
]
