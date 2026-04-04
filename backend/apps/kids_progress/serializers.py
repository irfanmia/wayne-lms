from rest_framework import serializers
from .models import KidProgress, KidAchievement, KidStreak


class KidProgressSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)

    class Meta:
        model = KidProgress
        fields = ['id', 'challenge', 'challenge_title', 'completed', 'points_earned',
                  'attempts', 'time_spent_seconds', 'completed_at']
        read_only_fields = ['points_earned', 'completed_at']


class KidProgressSubmitSerializer(serializers.Serializer):
    challenge_id = serializers.IntegerField()
    workspace_json = serializers.JSONField(required=False, default=dict)
    completed = serializers.BooleanField(default=False)
    time_spent_seconds = serializers.IntegerField(default=0)


class KidAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidAchievement
        fields = ['id', 'badge_type', 'title', 'description', 'icon_emoji', 'earned_at']


class KidStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidStreak
        fields = ['current_streak', 'longest_streak', 'last_activity_date']


class KidDashboardSerializer(serializers.Serializer):
    profile = serializers.DictField()
    streak = serializers.DictField()
    recent_achievements = serializers.ListField()
    recent_progress = serializers.ListField()
    stats = serializers.DictField()
