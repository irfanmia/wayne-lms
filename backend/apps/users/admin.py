from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'display_name', 'is_pro_member', 'preferred_language')
    list_filter = ('is_pro_member', 'preferred_language', 'is_staff')
    search_fields = ('username', 'email', 'display_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('display_name', 'bio', 'avatar', 'github_url', 'linkedin_url', 'location', 'preferred_language')}),
        ('Pro Membership', {'fields': ('is_pro_member', 'pro_expires_at')}),
    )
