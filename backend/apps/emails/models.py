from django.db import models
from django.conf import settings


class EmailTemplate(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    subject = models.CharField(max_length=255)
    html_body = models.TextField()
    text_body = models.TextField(blank=True)
    variables = models.JSONField(default=list)
    category = models.CharField(max_length=30, choices=[
        ('auth', 'Authentication'), ('enrollment', 'Enrollment'), ('completion', 'Completion'),
        ('payment', 'Payment'), ('notification', 'Notification'), ('marketing', 'Marketing'),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class EmailLog(models.Model):
    template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    to_email = models.EmailField()
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[('sent', 'Sent'), ('failed', 'Failed'), ('queued', 'Queued')])
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.to_email} - {self.status}"


class BulkEmail(models.Model):
    subject = models.CharField(max_length=255)
    body = models.TextField()
    recipient_filter = models.CharField(max_length=30, choices=[
        ('all', 'All Users'), ('students', 'Students'), ('instructors', 'Instructors'), ('course', 'Course Enrollees'),
    ])
    course = models.ForeignKey('courses.Course', on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'), ('scheduled', 'Scheduled'), ('sent', 'Sent'), ('failed', 'Failed'),
    ])
    recipients_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject
