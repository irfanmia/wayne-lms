from django.contrib import admin
from .models import AITutorSettings, AITutorConversation, StudentProfile


@admin.register(AITutorSettings)
class AITutorSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'provider', 'model_name', 'enabled', 'email_notifications')
    fieldsets = (
        (None, {'fields': ('enabled', 'provider', 'model_name', 'api_key')}),
        ('Prompts', {'fields': ('system_prompt',)}),
        ('Notifications', {'fields': ('email_notifications',)}),
    )

    def has_add_permission(self, request):
        return not AITutorSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AITutorConversation)
class AITutorConversationAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'lesson_id', 'lesson_type', 'message_count', 'created_at', 'updated_at')
    list_filter = ('lesson_type', 'course')
    search_fields = ('user__username', 'user__first_name')
    readonly_fields = ('user', 'course', 'lesson_id', 'lesson_type', 'messages', 'created_at', 'updated_at')

    def message_count(self, obj):
        return len(obj.messages) if obj.messages else 0
    message_count.short_description = 'Messages'


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_summary_short', 'updated_at')
    search_fields = ('user__username', 'user__first_name', 'profile_summary')
    readonly_fields = ('user', 'profile_data', 'profile_summary', 'updated_at')

    def profile_summary_short(self, obj):
        return (obj.profile_summary or '-')[:80]
    profile_summary_short.short_description = 'Summary'
