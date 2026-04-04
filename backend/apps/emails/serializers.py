from rest_framework import serializers
from .models import EmailTemplate, EmailLog, BulkEmail


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = '__all__'
        read_only_fields = ['sent_at']


class BulkEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkEmail
        fields = '__all__'


class SendTestEmailSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    to_email = serializers.EmailField()
    variables = serializers.DictField(required=False, default=dict)
