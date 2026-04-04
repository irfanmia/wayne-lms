from django.contrib import admin
from .models import KidCourse, KidLesson, KidChallenge


class KidLessonInline(admin.TabularInline):
    model = KidLesson
    extra = 0


class KidChallengeInline(admin.TabularInline):
    model = KidChallenge
    extra = 0


@admin.register(KidCourse)
class KidCourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'age_group', 'status', 'order']
    list_filter = ['age_group', 'status']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [KidLessonInline]


@admin.register(KidLesson)
class KidLessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    inlines = [KidChallengeInline]


@admin.register(KidChallenge)
class KidChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'difficulty', 'challenge_type', 'points']
    list_filter = ['difficulty', 'challenge_type']
