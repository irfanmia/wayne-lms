from django.contrib import admin
from .models import Course, Module, Lesson, Quiz, Question, Choice, CoursePrerequisite, CourseInstructor

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('slug', 'level', 'is_free', 'price', 'created_at')
    list_filter = ('level', 'is_free', 'category')
    search_fields = ('slug', 'category')
    inlines = [ModuleInline]

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('course', 'order')
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('module', 'lesson_type', 'duration', 'order', 'is_free_preview')
    list_filter = ('lesson_type', 'is_free_preview')

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
