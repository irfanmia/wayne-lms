from rest_framework import serializers
from .models import PointConfig, PointTransaction, UserPoints, Badge


class PointConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointConfig
        fields = '__all__'


class PointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = ['id', 'action', 'points', 'description', 'created_at']


class UserPointsSerializer(serializers.ModelSerializer):
    available_points = serializers.IntegerField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserPoints
        fields = ['total_points', 'redeemed_points', 'available_points', 'username']


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    display_name = serializers.SerializerMethodField()
    avatar = serializers.CharField(source='user.avatar', default='')

    class Meta:
        model = UserPoints
        fields = ['username', 'display_name', 'avatar', 'total_points']

    def get_display_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'slug', 'description', 'icon_url', 'criteria_type', 'criteria_value']
