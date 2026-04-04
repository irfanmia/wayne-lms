from django.db import models
from django.conf import settings


class MediaFile(models.Model):
    FILE_TYPE_CHOICES = [
        ('image', 'Image'), ('video', 'Video'), ('document', 'Document'), ('audio', 'Audio'),
    ]

    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='media_files')
    file = models.FileField(upload_to='media_files/')
    filename = models.CharField(max_length=500)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='document')
    mime_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    folder = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.filename
