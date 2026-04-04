from django.conf import settings
from django.db import models


class LiveClass(models.Model):
    PLATFORM_CHOICES = [
        ('google_meet', 'Google Meet'),
        ('zoom', 'Zoom'),
        ('microsoft_teams', 'Microsoft Teams'),
    ]
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='live_classes')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='live_classes')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    meeting_url = models.URLField(blank=True, help_text='Manual meeting link or auto-generated')
    meeting_id = models.CharField(max_length=100, blank=True, help_text='Platform meeting ID')
    recording_url = models.URLField(blank=True)
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(help_text='Duration in minutes', default=60)
    max_attendees = models.IntegerField(default=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    timezone = models.CharField(max_length=50, default='UTC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} - {self.scheduled_at}"


class LiveClassAttendance(models.Model):
    live_class = models.ForeignKey(LiveClass, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['live_class', 'user']

    def __str__(self):
        return f"{self.user} - {self.live_class.title}"
