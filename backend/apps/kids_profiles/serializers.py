from rest_framework import serializers
from .models import KidProfile, ParentProfile


class KidProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = KidProfile
        fields = ['id', 'username', 'display_name', 'age', 'grade', 'avatar_type',
                  'avatar_color', 'total_points', 'current_level', 'created_at']
        read_only_fields = ['total_points', 'current_level']


class KidProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidProfile
        fields = ['display_name', 'age', 'grade', 'avatar_type', 'avatar_color']


class ParentProfileSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = ParentProfile
        fields = ['id', 'phone', 'notification_email', 'daily_time_limit_minutes', 'children']

    def get_children(self, obj):
        kids = KidProfile.objects.filter(parent=obj.user)
        return KidProfileSerializer(kids, many=True).data
