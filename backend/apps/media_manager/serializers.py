from rest_framework import serializers
from .models import MediaFile


class MediaFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = ['id', 'uploaded_by', 'uploaded_by_name', 'file', 'filename',
                  'file_type', 'mime_type', 'size_bytes', 'folder', 'created_at']
        read_only_fields = ['uploaded_by', 'filename', 'mime_type', 'size_bytes']

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
