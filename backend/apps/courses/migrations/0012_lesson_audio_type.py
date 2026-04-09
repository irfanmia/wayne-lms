from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('courses', '0011_category_and_course_category_fk')]
    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='lesson_type',
            field=models.CharField(
                max_length=10,
                choices=[
                    ('video', 'Video'), ('text', 'Text'), ('audio', 'Audio'),
                    ('quiz', 'Quiz'), ('exercise', 'Exercise'), ('slides', 'Slides'),
                    ('stream', 'Stream'), ('assignment', 'Assignment'),
                ],
                default='text',
            ),
        ),
        # Also add audio_url field for audio lessons
        migrations.AddField(
            model_name='lesson',
            name='audio_url',
            field=models.URLField(blank=True),
        ),
    ]
