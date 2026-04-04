from django.contrib import admin
from .models import Coupon, SmartCouponConfig, CouponUsage

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'type', 'value', 'used_count', 'usage_limit', 'active', 'valid_from', 'valid_to']
    list_filter = ['type', 'active', 'scope']
    search_fields = ['code']

@admin.register(SmartCouponConfig)
class SmartCouponConfigAdmin(admin.ModelAdmin):
    list_display = ['coupon_type', 'enabled', 'discount_percentage']

@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'used_at']
