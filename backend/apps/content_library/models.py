from django.db import models
from django.conf import settings


class ReusableLesson(models.Model):
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=20, choices=[
        ('text', 'Text'), ('video', 'Video'), ('audio', 'Audio'), ('slides', 'Slides'), ('stream', 'Stream'),
    ])
    content = models.TextField(blank=True)
    short_description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ReusableQuiz(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    time_limit_minutes = models.IntegerField(default=15)
    passing_percentage = models.IntegerField(default=70)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ReusableQuizQuestion(models.Model):
    quiz = models.ForeignKey(ReusableQuiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=[
        ('single_choice', 'Single Choice'), ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'), ('matching', 'Matching'),
        ('fill_in', 'Fill in the Gap'), ('keywords', 'Keywords'),
    ])
    question_text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.JSONField(default=dict)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.question_text[:50]


class ReusableAssignment(models.Model):
    title = models.CharField(max_length=255)
    assignment_type = models.CharField(max_length=20, choices=[
        ('essay', 'Essay'), ('code', 'Code'), ('file_upload', 'File Upload'), ('url', 'URL'), ('mixed', 'Mixed'),
    ])
    instructions = models.TextField()
    rubric = models.JSONField(default=list)
    max_attempts = models.IntegerField(default=3)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
