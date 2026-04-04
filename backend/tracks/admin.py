from django.contrib import admin
from .models import Track, Concept, Exercise, TrackEnrollment, Submission


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'difficulty', 'is_featured', 'student_count']
    list_filter = ['difficulty', 'is_featured']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ['name', 'track', 'order']
    list_filter = ['track']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['title', 'track', 'difficulty', 'exercise_type', 'order']
    list_filter = ['track', 'difficulty', 'exercise_type']
    search_fields = ['title']


@admin.register(TrackEnrollment)
class TrackEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'track', 'enrolled_at']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'exercise', 'status', 'submitted_at']
    list_filter = ['status']
