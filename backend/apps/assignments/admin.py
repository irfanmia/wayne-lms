from django.contrib import admin
from .models import Assignment, AssignmentSubmission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'submission_type', 'answer_type', 'programming_language', 'points', 'max_attempts', 'auto_grade', 'due_date')
    list_filter = ('submission_type', 'answer_type', 'auto_grade')
    search_fields = ('title',)
    fieldsets = (
        (None, {'fields': ('course', 'lesson', 'title', 'description', 'points', 'due_date')}),
        ('Submission Settings', {'fields': ('submission_type', 'answer_type', 'max_file_size', 'allowed_extensions', 'max_attempts')}),
        ('Code Settings', {'fields': ('programming_language', 'starter_code', 'test_code', 'auto_grade')}),
        ('Grading', {'fields': ('rubric',)}),
    )


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'assignment', 'attempt_number', 'status', 'grade', 'submitted_at')
    list_filter = ('status',)
    readonly_fields = ('auto_grade_result',)
