from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import EmailOrUsernameTokenSerializer
from .views import CurrentUserView, RegisterView, GitHubAuthView, AdminUserListView, AdminUserDetailView, AdminUserStatsView


class EmailOrUsernameTokenView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer


urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailOrUsernameTokenView.as_view(), name='login'),
    path('auth/github/', GitHubAuthView.as_view(), name='github-auth'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    # Admin endpoints
    path('', AdminUserListView.as_view(), name='admin-user-list'),
    path('<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('stats/', AdminUserStatsView.as_view(), name='admin-user-stats'),
]
