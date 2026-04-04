from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'course', 'track', 'issued_at', 'is_verified']
    list_filter = ['is_verified']
    search_fields = ['title', 'user__username']
