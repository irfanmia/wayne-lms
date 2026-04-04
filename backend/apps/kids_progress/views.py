from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import KidProgress, KidAchievement, KidStreak
from .serializers import (KidProgressSerializer, KidProgressSubmitSerializer,
                          KidAchievementSerializer, KidStreakSerializer)
from apps.kids_profiles.models import KidProfile
from apps.kids_profiles.serializers import KidProfileSerializer
from apps.kids_curriculum.models import KidChallenge


class KidProgressViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = KidProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        kid, _ = KidProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'display_name': self.request.user.get_full_name() or self.request.user.username, 'age': 10}
        )
        return KidProgress.objects.filter(kid=kid)

    @action(detail=False, methods=['post'], url_path='submit')
    def submit(self, request):
        serializer = KidProgressSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            challenge = KidChallenge.objects.get(id=data['challenge_id'])
        except KidChallenge.DoesNotExist:
            return Response({'detail': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)

        # Auto-create KidProfile if user doesn't have one
        kid, _ = KidProfile.objects.get_or_create(
            user=request.user,
            defaults={'display_name': request.user.get_full_name() or request.user.username, 'age': 10}
        )

        progress, created = KidProgress.objects.get_or_create(kid=kid, challenge=challenge)
        progress.attempts += 1
        progress.workspace_json = data.get('workspace_json', {})
        progress.time_spent_seconds += data.get('time_spent_seconds', 0)

        if data.get('completed') and not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.points_earned = challenge.points
            kid.total_points += challenge.points
            # Level up every 100 points
            kid.current_level = (kid.total_points // 100) + 1
            kid.save()
            # Update streak
            self._update_streak(kid)
            # Check achievements
            self._check_achievements(kid)

        progress.save()
        return Response(KidProgressSerializer(progress).data)

    def _update_streak(self, kid):
        streak, _ = KidStreak.objects.get_or_create(kid=kid)
        today = timezone.now().date()
        if streak.last_activity_date == today:
            return
        if streak.last_activity_date and (today - streak.last_activity_date).days == 1:
            streak.current_streak += 1
        elif streak.last_activity_date != today:
            streak.current_streak = 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.last_activity_date = today
        streak.save()

    def _check_achievements(self, kid):
        completed_count = KidProgress.objects.filter(kid=kid, completed=True).count()
        streak = KidStreak.objects.filter(kid=kid).first()
        checks = [
            (completed_count >= 1, 'first_code', 'First Code! 🎉', 'You wrote your first code!', '🎉'),
            (streak and streak.current_streak >= 3, 'streak_3', '3-Day Streak 🔥', '3 days in a row!', '🔥'),
            (streak and streak.current_streak >= 7, 'streak_7', 'Week Warrior 💪', '7 days in a row!', '💪'),
            (kid.total_points >= 100, 'points_100', 'Century Club 💯', 'You earned 100 points!', '💯'),
            (kid.total_points >= 500, 'points_500', 'Super Coder ⚡', 'You earned 500 points!', '⚡'),
        ]
        for condition, badge_type, title, desc, emoji in checks:
            if condition:
                KidAchievement.objects.get_or_create(
                    kid=kid, badge_type=badge_type,
                    defaults={'title': title, 'description': desc, 'icon_emoji': emoji}
                )


class KidDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Auto-create KidProfile if user doesn't have one
        kid, _ = KidProfile.objects.get_or_create(
            user=request.user,
            defaults={'display_name': request.user.get_full_name() or request.user.username, 'age': 10}
        )

        streak = KidStreak.objects.filter(kid=kid).first()
        achievements = KidAchievement.objects.filter(kid=kid)[:5]
        recent = KidProgress.objects.filter(kid=kid).order_by('-updated_at')[:5]
        total_completed = KidProgress.objects.filter(kid=kid, completed=True).count()
        total_challenges = KidChallenge.objects.filter(lesson__course__status='published').count()

        return Response({
            'profile': KidProfileSerializer(kid).data,
            'streak': KidStreakSerializer(streak).data if streak else {'current_streak': 0, 'longest_streak': 0},
            'recent_achievements': KidAchievementSerializer(achievements, many=True).data,
            'recent_progress': KidProgressSerializer(recent, many=True).data,
            'stats': {
                'total_points': kid.total_points,
                'current_level': kid.current_level,
                'challenges_completed': total_completed,
                'total_challenges': total_challenges,
                'badges_earned': KidAchievement.objects.filter(kid=kid).count(),
            }
        })
