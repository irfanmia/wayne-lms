from django.db import models
from accounts.models import User


class Track(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    description_ar = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    icon = models.URLField(blank=True)
    difficulty = models.CharField(max_length=20, default='beginner')
    is_featured = models.BooleanField(default=False)
    student_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Concept(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='concepts')
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Exercise(models.Model):
    DIFFICULTY = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    TYPE = [('learning', 'Learning'), ('practice', 'Practice')]

    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='exercises')
    concept = models.ForeignKey(Concept, on_delete=models.SET_NULL, null=True, blank=True, related_name='exercises')
    title = models.CharField(max_length=255)
    slug = models.SlugField()
    description = models.TextField()
    instructions = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY, default='easy')
    exercise_type = models.CharField(max_length=20, choices=TYPE, default='practice')
    starter_code = models.TextField(blank=True)
    test_code = models.TextField(blank=True)
    solution_code = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        unique_together = ['track', 'slug']

    def __str__(self):
        return self.title


class TrackEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='track_enrollments')
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'track']


class Submission(models.Model):
    STATUS = [('pending', 'Pending'), ('passed', 'Passed'), ('failed', 'Failed')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    test_results = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)
