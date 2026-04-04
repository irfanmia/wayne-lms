from django.contrib import admin
from .models import Certificate

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_id', 'user', 'course', 'track', 'issued_at')
    list_filter = ('issued_at',)
    search_fields = ('user__username', 'certificate_id')
