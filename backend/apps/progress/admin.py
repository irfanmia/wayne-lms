from django.contrib import admin
from .models import Enrollment, ExerciseSubmission, TrackProgress

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at', 'progress_percent')
    list_filter = ('course',)
    search_fields = ('user__username',)

@admin.register(ExerciseSubmission)
class ExerciseSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'language', 'status', 'submitted_at')
    list_filter = ('status', 'language')
    search_fields = ('user__username',)

@admin.register(TrackProgress)
class TrackProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'track', 'exercises_completed', 'last_activity')
    list_filter = ('track',)
    search_fields = ('user__username',)
