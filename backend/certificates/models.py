from django.db import models
from accounts.models import User
from courses.models import Course
from tracks.models import Track
import uuid


class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    track = models.ForeignKey(Track, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    issued_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
