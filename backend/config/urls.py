from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from apps.users.urls import EmailOrUsernameTokenView
from apps.tracks.views import ExerciseViewSet

api_patterns = [
    path('auth/token/', EmailOrUsernameTokenView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/', include('apps.users.urls')),
    path('users/', include('apps.users.urls')),
    path('tracks/', include('apps.tracks.urls')),
    path('courses/', include('apps.courses.urls')),
    path('progress/', include('apps.progress.urls')),
    path('certificates/', include('apps.certificates.urls')),
    path('exercises/', ExerciseViewSet.as_view({'get': 'list'}), name='exercises-list'),
    path('execute/', include('apps.executor.urls')),
    # New feature APIs
    path('bundles/', include('apps.bundles.urls')),
    path('groups/', include('apps.groups.urls')),
    path('points/', include('apps.gamification.urls')),
    path('gamification/', include('apps.gamification.urls')),
    path('', include('apps.analytics.urls')),
    path('assignments/', include('apps.assignments.urls')),
    path('ai-tutor/', include('apps.ai_tutor.urls')),
    path('gradebook/', include('apps.gradebook.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('forms/', include('apps.lmsforms.urls')),
    path('media/', include('apps.media_manager.urls')),
    path('coupons/', include('apps.coupons.urls')),
    path('payments/', include('apps.payments.urls')),
    path('roles/', include('apps.roles.urls')),
    path('emails/', include('apps.emails.urls')),
    path('platform/', include('apps.platform.urls')),
    path('content-library/', include('apps.content_library.urls')),
    path('kids/', include('apps.kids_profiles.urls')),
    path('kids/curriculum/', include('apps.kids_curriculum.urls')),
    path('kids/progress/', include('apps.kids_progress.urls')),
    path('kids/classrooms/', include('apps.kids_classroom.urls')),
    path('live-classes/', include('apps.live_classes.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
    path('api/v1/', include(api_patterns)),
]
