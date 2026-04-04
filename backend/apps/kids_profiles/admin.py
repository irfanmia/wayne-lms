from django.contrib import admin
from .models import KidProfile, ParentProfile


@admin.register(KidProfile)
class KidProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'user', 'age', 'grade', 'current_level', 'total_points']
    list_filter = ['grade', 'current_level']
    search_fields = ['display_name', 'user__username']


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'daily_time_limit_minutes']
