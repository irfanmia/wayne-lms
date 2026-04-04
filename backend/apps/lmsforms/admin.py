from django.contrib import admin
from .models import LMSForm, FormField

class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 1

@admin.register(LMSForm)
class LMSFormAdmin(admin.ModelAdmin):
    list_display = ('name', 'form_type', 'is_active')
    inlines = [FormFieldInline]
