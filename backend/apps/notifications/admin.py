from django.contrib import admin
from .models import EmailTemplate, NotificationLog

@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'trigger', 'is_active', 'updated_at')
    list_filter = ('trigger', 'is_active')

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'template', 'status', 'sent_at')
    list_filter = ('status',)
