from django.contrib import admin
from .models import Course, Module, Lesson, Quiz, Question, Choice, CoursePrerequisite, CourseInstructor


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('title', 'lesson_type', 'duration', 'order', 'is_free_preview')


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('slug', 'course_type', 'level', 'is_free', 'price', 'is_featured', 'created_at')
    list_filter = ('course_type', 'level', 'is_free', 'is_featured', 'category')
    search_fields = ('slug', 'category')
    inlines = [ModuleInline]
    fieldsets = (
        (None, {'fields': ('slug', 'title', 'description', 'thumbnail', 'category')}),
        ('Course Type', {'fields': ('course_type', 'industry_meta')}),
        ('Settings', {'fields': ('level', 'duration', 'price', 'is_free', 'is_featured', 'instructor')}),
        ('Features', {'fields': (
            'enable_certificates', 'enable_discussions', 'enable_quizzes',
            'enable_assignments', 'enable_points', 'enable_practice',
            'enable_prerequisites', 'enable_multi_instructor',
        )}),
        ('Content', {'fields': ('what_youll_learn', 'who_should_take')}),
    )


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title_display', 'course', 'order')
    list_filter = ('course',)
    inlines = [LessonInline]

    def title_display(self, obj):
        t = obj.title
        return t.get('en', str(t)) if isinstance(t, dict) else str(t)
    title_display.short_description = 'Title'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title_display', 'module', 'lesson_type', 'duration', 'order', 'is_free_preview')
    list_filter = ('lesson_type', 'is_free_preview', 'module__course')
    search_fields = ('title',)

    def title_display(self, obj):
        t = obj.title
        return t.get('en', str(t)) if isinstance(t, dict) else str(t)
    title_display.short_description = 'Title'


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'course', 'quiz_type', 'is_public', 'standalone_slug')
    list_filter = ('quiz_type', 'is_public')


@admin.register(CoursePrerequisite)
class CoursePrerequisiteAdmin(admin.ModelAdmin):
    list_display = ('course', 'required_course')


@admin.register(CourseInstructor)
class CourseInstructorAdmin(admin.ModelAdmin):
    list_display = ('course', 'instructor', 'role', 'order')
