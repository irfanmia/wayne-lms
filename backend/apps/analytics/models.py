from django.db import models
from django.conf import settings


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [('stripe', 'Stripe'), ('paypal', 'PayPal')]
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('completed', 'Completed'),
        ('failed', 'Failed'), ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='stripe')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reference_id = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - ${self.amount} ({self.status})"


class Subscription(models.Model):
    PLAN_CHOICES = [('monthly', 'Monthly'), ('annual', 'Annual'), ('lifetime', 'Lifetime')]
    STATUS_CHOICES = [('active', 'Active'), ('cancelled', 'Cancelled'), ('expired', 'Expired')]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='monthly')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    starts_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user} - {self.plan} ({self.status})"
