from django.db import models
from django.conf import settings


class Coupon(models.Model):
    TYPE_CHOICES = [('percentage', 'Percentage'), ('fixed', 'Fixed Amount'), ('free', 'Free')]
    SCOPE_CHOICES = [('all', 'All Courses'), ('selected', 'Selected Courses'), ('bundles', 'Bundles')]

    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    usage_limit = models.IntegerField(default=100)
    used_count = models.IntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='all')
    courses = models.ManyToManyField('courses.Course', blank=True, related_name='coupons')
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.code


class SmartCouponConfig(models.Model):
    COUPON_TYPE_CHOICES = [
        ('birthday', 'Birthday'), ('welcome', 'Welcome'),
        ('referral', 'Referral'), ('abandoned_cart', 'Abandoned Cart'),
    ]
    coupon_type = models.CharField(max_length=30, unique=True, choices=COUPON_TYPE_CHOICES)
    enabled = models.BooleanField(default=False)
    discount_percentage = models.IntegerField(default=10)
    extra_config = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.coupon_type


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    order = models.ForeignKey('payments.Order', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user} used {self.coupon.code}"
