from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Badge, MembershipPlan, UserMembership


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_pro', 'is_instructor', 'reputation', 'streak']
    list_filter = ['is_pro', 'is_instructor', 'preferred_language']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('avatar', 'bio', 'location', 'reputation', 'streak',
                                'is_pro', 'is_instructor', 'preferred_language',
                                'github_id', 'google_id')}),
    )


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_monthly', 'price_yearly', 'is_popular']


@admin.register(UserMembership)
class UserMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'is_active', 'start_date', 'end_date']
    list_filter = ['is_active']
