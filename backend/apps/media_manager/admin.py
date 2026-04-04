from django.contrib import admin
from .models import MediaFile

@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'file_type', 'uploaded_by', 'size_bytes', 'folder', 'created_at')
    list_filter = ('file_type',)
    search_fields = ('filename', 'folder')
