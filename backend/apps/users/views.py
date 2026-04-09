from rest_framework import generics, permissions, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import User
from .serializers import UserSerializer, AdminUserSerializer


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the currently authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    """Register a new user with username/email/password. Returns JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({'detail': 'username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class GitHubAuthView(APIView):
    """Exchange GitHub OAuth profile for backend JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        name = request.data.get('name', '').strip()
        avatar = request.data.get('avatar', '').strip()

        if not email:
            return Response({'detail': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create user by email
        user = User.objects.filter(email=email).first()
        if not user:
            # Create new user from GitHub profile
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,  # No password for OAuth users
            )
            user.display_name = name
            if avatar:
                user.avatar = avatar
            user.save()

        # Update avatar/name if changed
        updated = False
        if name and not user.display_name:
            user.display_name = name
            updated = True
        if avatar and not user.avatar:
            user.avatar = avatar
            updated = True
        if updated:
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class AdminUserListView(generics.ListCreateAPIView):
    """Admin endpoint: list all users with search/filter, create new users."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'display_name']
    ordering_fields = ['date_joined', 'last_login', 'username', 'email']
    ordering = ['-date_joined']

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        status_param = self.request.query_params.get('status')

        if role == 'admin':
            qs = qs.filter(is_superuser=True)
        elif role == 'instructor':
            qs = qs.filter(is_staff=True, is_superuser=False)
        elif role == 'student':
            qs = qs.filter(is_staff=False, is_superuser=False)
        elif role == 'pro':
            qs = qs.filter(is_pro_member=True)

        if status_param == 'active':
            qs = qs.filter(is_active=True)
        elif status_param == 'suspended':
            qs = qs.filter(is_active=False)

        return qs

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        role = request.data.get('role', 'Student')
        display_name = request.data.get('display_name', '')

        if not username or not email:
            return Response({'detail': 'username and email are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.display_name = display_name
        if role == 'Admin':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'Instructor':
            user.is_staff = True
        user.save()

        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin endpoint: get/update/delete a specific user."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        # Handle role changes
        role = request.data.get('role')
        if role == 'Admin':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'Instructor':
            user.is_staff = True
            user.is_superuser = False
        elif role in ('Student', 'Pro Student'):
            user.is_staff = False
            user.is_superuser = False
            if role == 'Pro Student':
                user.is_pro_member = True

        # Handle suspend/activate
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']

        for field in ('display_name', 'email', 'bio', 'location', 'avatar'):
            if field in request.data:
                setattr(user, field, request.data[field])

        user.save()
        return Response(AdminUserSerializer(user).data)


class AdminUserStatsView(APIView):
    """Admin endpoint: user statistics for dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        suspended = User.objects.filter(is_active=False).count()
        admins = User.objects.filter(is_superuser=True).count()
        instructors = User.objects.filter(is_staff=True, is_superuser=False).count()
        students = User.objects.filter(is_staff=False, is_superuser=False).count()
        pro = User.objects.filter(is_pro_member=True).count()
        recent_30d = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=30)).count()

        return Response({
            'total': total,
            'total_users': total,
            'active': active,
            'suspended': suspended,
            'admins': admins,
            'instructors': instructors,
            'students': students,
            'pro_members': pro,
            'new_last_30_days': recent_30d,
        })
