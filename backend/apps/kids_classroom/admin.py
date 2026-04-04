from django.contrib import admin
from .models import Classroom, ClassroomMembership, ClassroomAssignment


class MembershipInline(admin.TabularInline):
    model = ClassroomMembership
    extra = 0


class AssignmentInline(admin.TabularInline):
    model = ClassroomAssignment
    extra = 0


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'teacher', 'join_code', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MembershipInline, AssignmentInline]
