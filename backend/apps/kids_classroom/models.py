from django.db import models
from django.conf import settings
from apps.kids_profiles.models import KidProfile
from apps.kids_curriculum.models import KidChallenge


class Classroom(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='classrooms')
    join_code = models.CharField(max_length=8, unique=True)
    is_active = models.BooleanField(default=True)
    max_students = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ClassroomMembership(models.Model):
    ROLE_CHOICES = [('student', 'Student'), ('assistant', 'Assistant')]

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='memberships')
    kid = models.ForeignKey(KidProfile, on_delete=models.CASCADE, related_name='classroom_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['classroom', 'kid']

    def __str__(self):
        return f"{self.kid.display_name} in {self.classroom.name}"


class ClassroomAssignment(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    challenge = models.ForeignKey(KidChallenge, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    is_required = models.BooleanField(default=True)

    class Meta:
        unique_together = ['classroom', 'challenge']

    def __str__(self):
        return f"{self.classroom.name} - {self.challenge.title}"
