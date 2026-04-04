from django.contrib import admin
from .models import EmailTemplate, EmailLog, BulkEmail

admin.site.register(EmailTemplate)
admin.site.register(EmailLog)
admin.site.register(BulkEmail)
