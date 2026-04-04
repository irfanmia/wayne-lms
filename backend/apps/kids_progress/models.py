from django.db import models
from apps.kids_profiles.models import KidProfile
from apps.kids_curriculum.models import KidChallenge


class KidProgress(models.Model):
    kid = models.ForeignKey(KidProfile, on_delete=models.CASCADE, related_name='progress')
    challenge = models.ForeignKey(KidChallenge, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    workspace_json = models.JSONField(default=dict, blank=True, help_text='Saved Blockly workspace state')
    points_earned = models.PositiveIntegerField(default=0)
    attempts = models.PositiveIntegerField(default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['kid', 'challenge']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.kid.display_name} - {self.challenge.title}"


class KidAchievement(models.Model):
    BADGE_CHOICES = [
        ('first_code', 'First Code! 🎉'), ('streak_3', '3-Day Streak 🔥'),
        ('streak_7', 'Week Warrior 💪'), ('streak_30', 'Monthly Master 🏆'),
        ('points_100', 'Century Club 💯'), ('points_500', 'Super Coder ⚡'),
        ('points_1000', 'Code Legend 🌟'), ('all_easy', 'Easy Peasy 🌈'),
        ('all_medium', 'Challenge Accepted 🎯'), ('first_game', 'Game Maker 🎮'),
        ('first_animation', 'Animator 🎬'), ('helper', 'Helpful Friend 🤝'),
        ('speed_demon', 'Speed Coder ⏱️'), ('perfect_score', 'Perfectionist ✨'),
    ]

    kid = models.ForeignKey(KidProfile, on_delete=models.CASCADE, related_name='achievements')
    badge_type = models.CharField(max_length=30, choices=BADGE_CHOICES)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon_emoji = models.CharField(max_length=10, default='🏅')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['kid', 'badge_type']
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.kid.display_name} - {self.title}"


class KidStreak(models.Model):
    kid = models.OneToOneField(KidProfile, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.kid.display_name} - {self.current_streak} day streak"
