from django.contrib import admin
from .models import KidProgress, KidAchievement, KidStreak


@admin.register(KidProgress)
class KidProgressAdmin(admin.ModelAdmin):
    list_display = ['kid', 'challenge', 'completed', 'points_earned', 'attempts']
    list_filter = ['completed']


@admin.register(KidAchievement)
class KidAchievementAdmin(admin.ModelAdmin):
    list_display = ['kid', 'badge_type', 'title', 'earned_at']
    list_filter = ['badge_type']


@admin.register(KidStreak)
class KidStreakAdmin(admin.ModelAdmin):
    list_display = ['kid', 'current_streak', 'longest_streak', 'last_activity_date']
