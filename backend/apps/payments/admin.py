from django.contrib import admin
from .models import (PricingPlan, MembershipPlan, Order, Installment,
                     GroupPricingTier, EarlyBirdPricing, MoneyBackGuarantee, ScholarshipApplication)

@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ['course', 'pricing_type', 'price', 'currency', 'is_active']
    list_filter = ['pricing_type', 'is_active']

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'interval', 'is_active']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method']

@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    list_display = ['order', 'amount', 'due_date', 'status']

@admin.register(GroupPricingTier)
class GroupPricingTierAdmin(admin.ModelAdmin):
    list_display = ['course', 'min_seats', 'max_seats', 'price_per_seat']

@admin.register(EarlyBirdPricing)
class EarlyBirdPricingAdmin(admin.ModelAdmin):
    list_display = ['course', 'special_price', 'valid_until']

@admin.register(MoneyBackGuarantee)
class MoneyBackGuaranteeAdmin(admin.ModelAdmin):
    list_display = ['course', 'days', 'enabled']

@admin.register(ScholarshipApplication)
class ScholarshipApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'status', 'created_at']
    list_filter = ['status']
