from django.db import models
from django.conf import settings


class KidCourse(models.Model):
    AGE_GROUP_CHOICES = [('5-7', 'Ages 5-7'), ('8-10', 'Ages 8-10'), ('11-13', 'Ages 11-13')]
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, default='8-10')
    thumbnail = models.URLField(blank=True)
    icon_emoji = models.CharField(max_length=10, default='🚀')
    color = models.CharField(max_length=7, default='#F97316')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class KidLesson(models.Model):
    course = models.ForeignKey(KidCourse, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    intro_text = models.TextField(blank=True, help_text='Kid-friendly intro shown before the challenge')
    order = models.PositiveIntegerField(default=0)
    icon_emoji = models.CharField(max_length=10, default='📝')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'slug']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class KidChallenge(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy ⭐'), ('medium', 'Medium ⭐⭐'), ('hard', 'Hard ⭐⭐⭐')]
    CHALLENGE_TYPE_CHOICES = [
        ('blocks', 'Block Coding'), ('puzzle', 'Puzzle'), ('animation', 'Animation'),
        ('game', 'Game Building'), ('art', 'Creative Art'),
    ]

    lesson = models.ForeignKey(KidLesson, on_delete=models.CASCADE, related_name='challenges')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    instructions = models.TextField(help_text='Step-by-step kid-friendly instructions')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPE_CHOICES, default='blocks')
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)
    icon_emoji = models.CharField(max_length=10, default='🎯')

    # Blockly workspace
    starter_workspace_json = models.JSONField(default=dict, blank=True, help_text='Initial Blockly workspace')
    toolbox_json = models.JSONField(default=dict, blank=True, help_text='Available blocks for this challenge')
    solution_workspace_json = models.JSONField(default=dict, blank=True, help_text='Solution workspace')

    # PixiJS stage config
    stage_config = models.JSONField(default=dict, blank=True, help_text='PixiJS stage setup: sprites, background, etc.')
    expected_output = models.JSONField(default=dict, blank=True, help_text='Expected result for validation')

    # Hints
    hints = models.JSONField(default=list, blank=True, help_text='Array of hint strings')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['lesson', 'slug']

    def __str__(self):
        return self.title
