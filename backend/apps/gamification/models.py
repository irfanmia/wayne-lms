from django.db import models
from django.conf import settings


class PointConfig(models.Model):
    ACTION_CHOICES = [
        ('registered', 'Registered'), ('course_purchased', 'Course Purchased'),
        ('quiz_passed', 'Quiz Passed'), ('quiz_perfect', 'Quiz Perfect Score'),
        ('lesson_completed', 'Lesson Completed'), ('certificate_earned', 'Certificate Earned'),
        ('group_joined', 'Group Joined'),
    ]

    action = models.CharField(max_length=30, choices=ACTION_CHOICES, unique=True)
    points_awarded = models.PositiveIntegerField(default=10)
    point_name = models.CharField(max_length=50, default='coins')
    point_rate = models.FloatField(default=0.01, help_text='Dollar value per point')

    def __str__(self):
        return f"{self.action}: {self.points_awarded} {self.point_name}"


class UserPoints(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points')
    total_points = models.PositiveIntegerField(default=0)
    redeemed_points = models.PositiveIntegerField(default=0)

    @property
    def available_points(self):
        return self.total_points - self.redeemed_points

    def __str__(self):
        return f"{self.user}: {self.total_points} points"


class PointTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='point_transactions')
    action = models.CharField(max_length=30)
    points = models.IntegerField()
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user}: {self.points} ({self.action})"


class Badge(models.Model):
    CRITERIA_TYPE_CHOICES = [
        ('first_course', 'First Course Completed'), ('five_courses', 'Five Courses'),
        ('first_quiz', 'First Quiz Passed'), ('perfect_quiz', 'Perfect Quiz Score'),
        ('streak_7_days', '7-Day Streak'), ('first_assignment', 'First Assignment'),
        ('all_modules', 'All Modules Completed'), ('social_learner', 'Social Learner'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(blank=True)
    criteria_type = models.CharField(max_length=30, choices=CRITERIA_TYPE_CHOICES)
    criteria_value = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'badge']

    def __str__(self):
        return f"{self.user} - {self.badge}"
