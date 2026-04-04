from django.db import models
from django.conf import settings


class MembershipPlan(models.Model):
    INTERVAL_CHOICES = [('monthly', 'Monthly'), ('yearly', 'Yearly'), ('lifetime', 'Lifetime')]
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PricingPlan(models.Model):
    PRICING_TYPE_CHOICES = [
        ('free', 'Free'), ('one_time', 'One-time'), ('offline', 'Offline/Institute'),
        ('membership', 'Membership/Subscription'), ('installment', 'Installment'),
        ('bundle', 'Bundle'), ('pay_what_you_want', 'Pay What You Want'),
        ('waitlist', 'Waitlist'), ('scholarship', 'Scholarship'),
    ]
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='pricing_plans')
    pricing_type = models.CharField(max_length=30, choices=PRICING_TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    installment_count = models.IntegerField(default=1)
    installment_interval_days = models.IntegerField(default=30)
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    suggested_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    membership_plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.course} - {self.pricing_type}"


class Order(models.Model):
    PAYMENT_METHOD_CHOICES = [('stripe', 'Stripe'), ('paypal', 'PayPal'), ('bank', 'Bank Transfer'), ('offline', 'Offline')]
    STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed'), ('refunded', 'Refunded'), ('failed', 'Failed')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    course = models.ForeignKey('courses.Course', on_delete=models.SET_NULL, null=True, blank=True)
    bundle = models.ForeignKey('bundles.Bundle', on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    coupon = models.ForeignKey('coupons.Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stripe_payment_id = models.CharField(max_length=255, blank=True)
    paypal_order_id = models.CharField(max_length=255, blank=True)
    is_gift = models.BooleanField(default=False)
    gift_recipient_email = models.EmailField(blank=True)
    refund_reason = models.TextField(blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user}"


class Installment(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('paid', 'Paid'), ('overdue', 'Overdue')]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='installments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    paid_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Installment {self.id} for Order #{self.order_id}"


class GroupPricingTier(models.Model):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='group_tiers')
    min_seats = models.IntegerField()
    max_seats = models.IntegerField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.course} - {self.min_seats}-{self.max_seats} seats"


class EarlyBirdPricing(models.Model):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='early_bird')
    special_price = models.DecimalField(max_digits=10, decimal_places=2)
    valid_until = models.DateTimeField()

    def __str__(self):
        return f"{self.course} early bird"


class MoneyBackGuarantee(models.Model):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='money_back')
    days = models.IntegerField(default=30)
    enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.course} - {self.days} days"


class ScholarshipApplication(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    answers = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='scholarship_reviews')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.course} scholarship"
