from django.db import models
from django.conf import settings


class EmailTemplate(models.Model):
    TRIGGER_CHOICES = [
        ('welcome', 'Welcome'), ('enrollment', 'Enrollment'),
        ('lesson_complete', 'Lesson Complete'), ('quiz_passed', 'Quiz Passed'),
        ('certificate_issued', 'Certificate Issued'), ('assignment_graded', 'Assignment Graded'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    subject = models.CharField(max_length=500)
    body = models.TextField(help_text='Use {{student_name}}, {{course_name}}, {{date}} as variables')
    trigger = models.CharField(max_length=30, choices=TRIGGER_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class NotificationLog(models.Model):
    STATUS_CHOICES = [('sent', 'Sent'), ('failed', 'Failed')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_logs')
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.user} - {self.template} ({self.status})"
