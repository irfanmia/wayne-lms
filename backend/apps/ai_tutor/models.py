from django.conf import settings
from django.db import models


PROVIDER_CHOICES = [
    ('groq', 'Groq'),
    ('openai', 'OpenAI'),
]

DEFAULT_SYSTEM_PROMPT = (
    "You are a warm, patient AI tutor for Wayne LMS. "
    "Adapt your language to the student's level. Use simple terms, real-world examples, and analogies. "
    "Format your responses with markdown: use **bold** for key terms, bullet points for lists, "
    "tables when comparing things, and numbered steps for processes. "
    "Include relevant examples and analogies. Make content scannable, not wall-of-text. "
    "If a student's profile is provided, use that context — do NOT re-ask questions you already know the answer to. "
    "Only ask clarifying questions when genuinely needed to give a better answer."
)


class AITutorSettings(models.Model):
    """Singleton — platform-wide AI Tutor configuration."""
    enabled = models.BooleanField(default=False)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='groq')
    model_name = models.CharField(max_length=100, default='llama-3.3-70b-versatile')
    api_key = models.CharField(max_length=500, blank=True, default='')
    system_prompt = models.TextField(default=DEFAULT_SYSTEM_PROMPT)
    email_notifications = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'AI Tutor Settings'
        verbose_name_plural = 'AI Tutor Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"AI Tutor ({'enabled' if self.enabled else 'disabled'})"


class StudentProfile(models.Model):
    """Stores AI Tutor's understanding of a student — built from conversations."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_tutor_profile')
    profile_summary = models.TextField(blank=True, default='')
    # JSON: {role, industry, experience_level, goals, preferred_explanation_style, ...}
    profile_data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI Profile: {self.user}"


class AITutorConversation(models.Model):
    """One conversation per user × lesson. Messages stored as JSON list."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_tutor_conversations')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='ai_tutor_conversations')
    lesson_id = models.IntegerField()
    lesson_type = models.CharField(max_length=30, blank=True, default='')
    messages = models.JSONField(default=list)  # [{role, content, timestamp}]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'course', 'lesson_id']

    def __str__(self):
        return f"{self.user} — lesson {self.lesson_id} ({len(self.messages)} msgs)"
