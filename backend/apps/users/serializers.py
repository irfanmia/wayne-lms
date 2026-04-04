from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'display_name', 'bio', 'avatar',
                  'github_url', 'linkedin_url', 'location', 'preferred_language',
                  'is_pro_member', 'pro_expires_at', 'is_staff', 'is_superuser', 'role')
        read_only_fields = ('id', 'is_pro_member', 'pro_expires_at', 'is_staff', 'is_superuser')

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        if obj.is_staff:
            return 'instructor'
        return 'student'


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    courses_enrolled = serializers.SerializerMethodField()
    last_active = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'display_name', 'bio', 'avatar',
                  'github_url', 'linkedin_url', 'location', 'preferred_language',
                  'is_pro_member', 'pro_expires_at', 'is_active', 'is_staff',
                  'is_superuser', 'date_joined', 'last_login', 'role',
                  'courses_enrolled', 'last_active')
        read_only_fields = ('id', 'date_joined', 'last_login')

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Admin'
        if obj.is_staff:
            return 'Instructor'
        if obj.is_pro_member:
            return 'Pro Student'
        return 'Student'

    def get_courses_enrolled(self, obj):
        try:
            return obj.enrollment_set.count()
        except Exception:
            return 0

    def get_last_active(self, obj):
        return obj.last_login.isoformat() if obj.last_login else obj.date_joined.isoformat()


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Accept email or username in the 'username' field."""
    def validate(self, attrs):
        username = attrs.get('username', '')
        UserModel = get_user_model()
        # If it looks like an email, find the username
        if '@' in username:
            try:
                user = UserModel.objects.get(email=username)
                attrs['username'] = user.username
            except UserModel.DoesNotExist:
                pass
        return super().validate(attrs)
