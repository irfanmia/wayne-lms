from django.db import models

class Track(models.Model):
    DIFFICULTY_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]

    slug = models.SlugField(unique=True)
    title = models.JSONField(default=dict, help_text='i18n: {"en": "...", "ar": "..."}')
    description = models.JSONField(default=dict)
    icon_url = models.URLField(blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title.get('en', self.slug) if isinstance(self.title, dict) else self.slug


class Concept(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='concepts')
    slug = models.SlugField()
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['track', 'slug']

    def __str__(self):
        return f"{self.track.slug}/{self.slug}"


class Exercise(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]

    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='exercises')
    slug = models.SlugField()
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    instructions = models.JSONField(default=dict)
    starter_code = models.JSONField(default=dict, help_text='Keyed by language: {"python": "...", "javascript": "..."}')
    test_code = models.JSONField(default=dict)
    solution = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['concept', 'slug']

    def __str__(self):
        return self.slug
