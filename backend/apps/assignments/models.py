from django.db import models
from django.conf import settings


class Assignment(models.Model):
    SUBMISSION_TYPE_CHOICES = [
        ('text', 'Text/Essay'),
        ('file_upload', 'File Upload'),
        ('code', 'Code'),
        ('url', 'URL/Link'),
        ('mixed', 'Multiple Types'),
    ]

    ANSWER_TYPE_CHOICES = [
        ('essay', 'Written Essay'),
        ('document', 'Document Upload (PDF/DOCX)'),
        ('code_python', 'Python Code'),
        ('code_javascript', 'JavaScript Code'),
        ('code_any', 'Code (Any Language)'),
        ('project_url', 'Project URL (GitHub/CodePen)'),
        ('file_any', 'Any File'),
        ('mixed', 'Multiple Formats Accepted'),
    ]

    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    lesson = models.ForeignKey('courses.Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    submission_type = models.CharField(max_length=20, choices=SUBMISSION_TYPE_CHOICES, default='text')
    answer_type = models.CharField(max_length=20, choices=ANSWER_TYPE_CHOICES, default='essay')
    max_file_size = models.PositiveIntegerField(default=10, help_text='Max file size in MB')
    allowed_extensions = models.CharField(max_length=255, blank=True, help_text='Comma-separated, e.g. pdf,docx,zip')
    due_date = models.DateTimeField(null=True, blank=True)
    points = models.PositiveIntegerField(default=100)
    programming_language = models.CharField(max_length=50, blank=True, null=True, help_text='e.g. python, javascript, typescript')
    starter_code = models.TextField(blank=True, help_text='Pre-filled code template for code assignments')
    test_code = models.TextField(blank=True, help_text='Automated tests to run against code submissions')
    rubric = models.TextField(blank=True, help_text='Grading rubric/criteria description')
    max_attempts = models.PositiveIntegerField(default=1, help_text='How many times a student can submit')
    auto_grade = models.BooleanField(default=False, help_text='If True, run test_code against submission')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return self.title


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'), ('graded', 'Graded'), ('returned', 'Returned'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignment_submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='assignments/', blank=True)
    text_content = models.TextField(blank=True)
    url = models.URLField(blank=True)
    code_content = models.TextField(blank=True, help_text='For code submissions')
    code_language = models.CharField(max_length=50, blank=True, help_text='Language of submitted code')
    auto_grade_result = models.JSONField(null=True, blank=True, help_text='Automated test results')
    attempt_number = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    grade = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user} - {self.assignment} (attempt {self.attempt_number})"
