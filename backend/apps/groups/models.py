from django.db import models
from django.conf import settings


class Group(models.Model):
    name = models.CharField(max_length=200)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_groups')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='groups')
    max_seats = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships')
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='added_members')

    class Meta:
        unique_together = ['group', 'user']

    def __str__(self):
        return f"{self.user} in {self.group}"
