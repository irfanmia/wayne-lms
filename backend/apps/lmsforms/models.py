from django.db import models


class LMSForm(models.Model):
    FORM_TYPE_CHOICES = [
        ('registration', 'Registration'), ('enrollment', 'Enrollment'),
        ('profile', 'Profile'), ('feedback', 'Feedback'),
    ]

    name = models.CharField(max_length=255)
    form_type = models.CharField(max_length=20, choices=FORM_TYPE_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FormField(models.Model):
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'), ('email', 'Email'), ('textarea', 'Textarea'),
        ('select', 'Select'), ('checkbox', 'Checkbox'), ('radio', 'Radio'),
        ('file', 'File'),
    ]

    form = models.ForeignKey(LMSForm, on_delete=models.CASCADE, related_name='fields')
    field_name = models.CharField(max_length=100)
    field_label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text')
    placeholder = models.CharField(max_length=255, blank=True)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    options = models.JSONField(default=list, blank=True, help_text='For select/radio/checkbox')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.form.name} - {self.field_label}"
