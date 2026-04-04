from rest_framework import serializers
from .models import PlatformSettings

SECRET_FIELDS = [
    'stripe_secret_key', 'paypal_secret', 'smtp_password',
    'ses_access_key', 'ses_secret_key', 'mailchimp_api_key',
]


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        exclude = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask secret fields in GET responses (show last 4 chars only)
        for field in SECRET_FIELDS:
            if field in data and data[field]:
                val = str(data[field])
                data[field] = '••••••••' + val[-4:] if len(val) > 4 else '••••'
        return data
