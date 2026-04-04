from rest_framework import serializers
from .models import EmailTemplate, NotificationLog


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'


class NotificationLogSerializer(serializers.ModelSerializer):
    template_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = ['id', 'user', 'user_name', 'template', 'template_name', 'sent_at', 'status']

    def get_template_name(self, obj):
        return obj.template.name if obj.template else ''

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
