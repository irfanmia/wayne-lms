from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('platform_settings', '0001_initial')]
    operations = [
        migrations.AddField(model_name='platformsettings', name='thumb_width',
            field=models.PositiveIntegerField(default=1280)),
        migrations.AddField(model_name='platformsettings', name='thumb_height',
            field=models.PositiveIntegerField(default=720)),
    ]
