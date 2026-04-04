from rest_framework import serializers
from .models import Certificate, CertificateTemplate


class CertificateTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateTemplate
        fields = '__all__'


class CertificateSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    template = CertificateTemplateSerializer(read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'certificate_id', 'user_name', 'course_title', 'template',
                  'issued_at', 'pdf_url']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_course_title(self, obj):
        if obj.course:
            t = obj.course.title
            return t.get('en', str(t)) if isinstance(t, dict) else str(t)
        if obj.track:
            t = obj.track.title
            return t.get('en', str(t)) if isinstance(t, dict) else str(t)
        return ''
