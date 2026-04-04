from django.contrib import admin
from .models import LiveClass, LiveClassAttendance


@admin.register(LiveClass)
class LiveClassAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'instructor', 'platform', 'status', 'scheduled_at']
    list_filter = ['status', 'platform', 'course']
    search_fields = ['title', 'description']
    date_hierarchy = 'scheduled_at'


@admin.register(LiveClassAttendance)
class LiveClassAttendanceAdmin(admin.ModelAdmin):
    list_display = ['live_class', 'user', 'joined_at', 'left_at']
    list_filter = ['live_class']
