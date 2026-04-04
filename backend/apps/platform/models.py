from django.db import models


class PlatformSettings(models.Model):
    platform_name = models.CharField(max_length=100, default='Wayne LMS')
    tagline = models.CharField(max_length=255, default='Learn to code')
    support_email = models.EmailField(default='support@wayne-lms.example.com')
    timezone = models.CharField(max_length=50, default='Asia/Dubai')
    default_language = models.CharField(max_length=5, default='en')
    maintenance_mode = models.BooleanField(default=False)

    logo_url = models.URLField(blank=True)
    favicon_url = models.URLField(blank=True)
    primary_color = models.CharField(max_length=7, default='#F97316')
    custom_css = models.TextField(blank=True)

    stripe_enabled = models.BooleanField(default=False)
    stripe_public_key = models.CharField(max_length=255, blank=True)
    stripe_secret_key = models.CharField(max_length=255, blank=True)
    paypal_enabled = models.BooleanField(default=False)
    paypal_client_id = models.CharField(max_length=255, blank=True)
    paypal_secret = models.CharField(max_length=255, blank=True)
    default_currency = models.CharField(max_length=3, default='USD')

    email_provider = models.CharField(max_length=10, choices=[('ses', 'AWS SES'), ('smtp', 'SMTP')], default='ses')
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    smtp_encryption = models.CharField(max_length=5, choices=[('tls', 'TLS'), ('ssl', 'SSL')], default='tls')
    ses_region = models.CharField(max_length=30, blank=True)
    ses_access_key = models.CharField(max_length=255, blank=True)
    ses_secret_key = models.CharField(max_length=255, blank=True)
    from_name = models.CharField(max_length=100, default='Wayne LMS')
    from_email = models.EmailField(default='noreply@wayne-lms.example.com')

    meta_title = models.CharField(max_length=255, default='Wayne LMS - Learn to Code')
    meta_description = models.TextField(default='Online coding platform')
    og_image_url = models.URLField(blank=True)
    google_analytics_id = models.CharField(max_length=50, blank=True)
    facebook_pixel_id = models.CharField(max_length=50, blank=True)

    mailchimp_api_key = models.CharField(max_length=255, blank=True)
    zapier_webhook_url = models.URLField(blank=True)
    slack_webhook_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Platform Settings'
        verbose_name_plural = 'Platform Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.platform_name
