from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ai_tutor', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('profile_summary', models.TextField(blank=True, default='')),
                ('profile_data', models.JSONField(default=dict)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ai_tutor_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='aitutorsettings',
            name='system_prompt',
            field=models.TextField(default="You are a warm, patient AI tutor for Wayne LMS. Adapt your language to the student's level. Use simple terms, real-world examples, and analogies. Format your responses with markdown: use **bold** for key terms, bullet points for lists, tables when comparing things, and numbered steps for processes. Include relevant examples and analogies. Make content scannable, not wall-of-text. If a student's profile is provided, use that context — do NOT re-ask questions you already know the answer to. Only ask clarifying questions when genuinely needed to give a better answer."),
        ),
    ]
