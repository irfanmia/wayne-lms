from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    reputation = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    is_pro = models.BooleanField(default=False)
    is_instructor = models.BooleanField(default=False)
    preferred_language = models.CharField(
        max_length=5, default='en',
        choices=[('en', 'English'), ('ar', 'Arabic'), ('es', 'Spanish')]
    )
    github_id = models.CharField(max_length=100, blank=True)
    google_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.username


class Badge(models.Model):
    name = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True)
    name_es = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=10)
    users = models.ManyToManyField(User, related_name='badges', blank=True)

    def __str__(self):
        return self.name


class MembershipPlan(models.Model):
    name = models.CharField(max_length=100)
    price_monthly = models.DecimalField(max_digits=8, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=8, decimal_places=2)
    features = models.JSONField(default=list)
    is_popular = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class UserMembership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='membership')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=False)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan}"
