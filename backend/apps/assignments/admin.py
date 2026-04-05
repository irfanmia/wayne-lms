from django.contrib import admin
from django.utils.html import format_html
from .models import Assignment, AssignmentSubmission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title_display', 'course_display', 'submission_type', 'answer_type', 'points', 'max_attempts', 'auto_grade', 'submissions_count', 'due_date')
    list_filter = ('submission_type', 'answer_type', 'auto_grade', 'course')
    search_fields = ('title', 'course__slug')
    fieldsets = (
        (None, {'fields': ('course', 'lesson', 'title', 'description', 'points', 'due_date')}),
        ('Submission Settings', {'fields': ('submission_type', 'answer_type', 'max_file_size', 'allowed_extensions', 'max_attempts')}),
        ('Code Settings', {'fields': ('programming_language', 'starter_code', 'test_code', 'auto_grade')}),
        ('Grading', {'fields': ('rubric',)}),
    )

    def title_display(self, obj):
        t = obj.title
        return t.get('en', str(t)) if isinstance(t, dict) else str(t)
    title_display.short_description = 'Title'

    def course_display(self, obj):
        t = obj.course.title
        slug = t.get('en', str(t)) if isinstance(t, dict) else str(t)
        return slug[:40]
    course_display.short_description = 'Course'

    def submissions_count(self, obj):
        return obj.submissions.count()
    submissions_count.short_description = 'Submissions'


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'assignment_title', 'attempt_number', 'status', 'grade', 'submitted_at', 'graded_at')
    list_filter = ('status', 'assignment__course')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'assignment__title')
    readonly_fields = ('user', 'assignment', 'attempt_number', 'submitted_at', 'auto_grade_result',
                       'text_content_display', 'code_content_display', 'url_display', 'file_display')
    fieldsets = (
        ('Submission Info', {
            'fields': ('user', 'assignment', 'attempt_number', 'submitted_at')
        }),
        ('Submitted Content', {
            'fields': ('text_content_display', 'code_content_display', 'url_display', 'file_display'),
            'description': 'Read-only view of what the student submitted.',
        }),
        ('Auto-Grade Result', {
            'fields': ('auto_grade_result',),
            'classes': ('collapse',),
        }),
        ('Grading', {
            'fields': ('status', 'grade', 'feedback'),
            'description': 'Set status to "graded", enter grade and feedback, then save.',
        }),
    )

    def assignment_title(self, obj):
        t = obj.assignment.title
        title = t.get('en', str(t)) if isinstance(t, dict) else str(t)
        return title[:50]
    assignment_title.short_description = 'Assignment'

    def text_content_display(self, obj):
        if not obj.text_content:
            return '-'
        return format_html('<div style="max-height:300px;overflow-y:auto;white-space:pre-wrap;background:#f9f9f9;padding:12px;border-radius:8px;border:1px solid #ddd;font-size:13px;">{}</div>', obj.text_content)
    text_content_display.short_description = 'Text Answer'

    def code_content_display(self, obj):
        if not obj.code_content:
            return '-'
        lang = obj.code_language or 'code'
        return format_html(
            '<div style="max-height:400px;overflow:auto;background:#1e1e2e;color:#a6e3a1;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;white-space:pre;">'
            '<strong style="color:#89b4fa;">{}</strong><br/><br/>{}</div>',
            lang, obj.code_content
        )
    code_content_display.short_description = 'Code'

    def url_display(self, obj):
        if not obj.url:
            return '-'
        return format_html('<a href="{}" target="_blank" rel="noopener">{}</a>', obj.url, obj.url)
    url_display.short_description = 'URL'

    def file_display(self, obj):
        if not obj.file:
            return '-'
        return format_html('<a href="{}" target="_blank" rel="noopener">📄 Download file</a>', obj.file.url)
    file_display.short_description = 'File'
