from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    LANGUAGE_CHOICES = [('en', 'English'), ('ar', 'Arabic'), ('es', 'Spanish')]
    ACCOUNT_TYPE_CHOICES = [('standard', 'Standard'), ('kid', 'Kid'), ('parent', 'Parent'), ('teacher', 'Teacher')]

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='standard')
    is_pro_member = models.BooleanField(default=False)
    pro_expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username
