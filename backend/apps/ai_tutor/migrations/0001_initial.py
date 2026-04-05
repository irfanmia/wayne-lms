from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('courses', '0010_add_course_type_and_industry_meta'),
    ]

    operations = [
        migrations.CreateModel(
            name='AITutorSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enabled', models.BooleanField(default=False)),
                ('provider', models.CharField(choices=[('groq', 'Groq'), ('openai', 'OpenAI')], default='groq', max_length=20)),
                ('model_name', models.CharField(default='llama-3.3-70b-versatile', max_length=100)),
                ('api_key', models.CharField(blank=True, default='', max_length=500)),
                ('system_prompt', models.TextField(default='You are a warm, patient AI tutor for Wayne LMS. Adapt your language to the student\'s level. Use simple terms, real-world examples, and analogies. When a student asks a question, first ask 1-2 short clarifying questions to understand their background and specific confusion, then give a clear, helpful answer. Be encouraging and supportive.')),
                ('email_notifications', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'AI Tutor Settings',
                'verbose_name_plural': 'AI Tutor Settings',
            },
        ),
        migrations.CreateModel(
            name='AITutorConversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lesson_id', models.IntegerField()),
                ('lesson_type', models.CharField(blank=True, default='', max_length=30)),
                ('messages', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_tutor_conversations', to='courses.course')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_tutor_conversations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'course', 'lesson_id')},
            },
        ),
    ]
