import uuid
from django.db import models
from django.conf import settings


class CertificateTemplate(models.Model):
    name = models.CharField(max_length=200)
    background_image = models.URLField(blank=True)
    layout_json = models.JSONField(default=dict, help_text='Positions of fields on certificate')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey('courses.Course', on_delete=models.SET_NULL, null=True, blank=True)
    track = models.ForeignKey('tracks.Track', on_delete=models.SET_NULL, null=True, blank=True)
    template = models.ForeignKey(CertificateTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    issued_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True)

    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.user}"
