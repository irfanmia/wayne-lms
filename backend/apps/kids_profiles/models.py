from django.db import models
from django.conf import settings


class KidProfile(models.Model):
    AVATAR_CHOICES = [
        ('robot', 'Robot'), ('cat', 'Cat'), ('dog', 'Dog'), ('unicorn', 'Unicorn'),
        ('dragon', 'Dragon'), ('astronaut', 'Astronaut'), ('ninja', 'Ninja'), ('wizard', 'Wizard'),
    ]
    GRADE_CHOICES = [(str(i), f'Grade {i}') for i in range(1, 13)]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kid_profile')
    display_name = models.CharField(max_length=50)
    age = models.PositiveIntegerField(null=True, blank=True)
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES, blank=True)
    avatar_type = models.CharField(max_length=20, choices=AVATAR_CHOICES, default='robot')
    avatar_color = models.CharField(max_length=7, default='#F97316')
    parent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='children_profiles')
    total_points = models.PositiveIntegerField(default=0)
    current_level = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ['-created_at']


class ParentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parent_profile')
    phone = models.CharField(max_length=20, blank=True)
    notification_email = models.EmailField(blank=True)
    daily_time_limit_minutes = models.PositiveIntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Parent: {self.user.username}"
