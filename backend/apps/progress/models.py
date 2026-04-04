from django.db import models
from django.conf import settings

class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percent = models.FloatField(default=0)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user} - {self.course}"


class ExerciseSubmission(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('running', 'Running'), ('passed', 'Passed'), ('failed', 'Failed')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    exercise = models.ForeignKey('tracks.Exercise', on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    language = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    output = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user} - {self.exercise} ({self.status})"


class TrackProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='track_progress')
    track = models.ForeignKey('tracks.Track', on_delete=models.CASCADE, related_name='user_progress')
    exercises_completed = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'track']

    def __str__(self):
        return f"{self.user} - {self.track}"
