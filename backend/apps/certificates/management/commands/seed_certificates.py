from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.certificates.models import Certificate, CertificateTemplate
from apps.courses.models import Course

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed sample certificates'

    def handle(self, *args, **options):
        template, _ = CertificateTemplate.objects.get_or_create(
            name='Classic', defaults={'is_default': True, 'layout_json': {'style': 'classic'}}
        )
        modern, _ = CertificateTemplate.objects.get_or_create(
            name='Modern', defaults={'layout_json': {'style': 'modern'}}
        )

        users = list(User.objects.exclude(is_superuser=True).order_by('?')[:5])
        courses = list(Course.objects.all()[:5])

        if not users or not courses:
            self.stdout.write(self.style.WARNING('Need users and courses first'))
            return

        created = 0
        for i in range(min(5, len(users))):
            user = users[i % len(users)]
            course = courses[i % len(courses)]
            tmpl = template if i % 2 == 0 else modern
            _, was_created = Certificate.objects.get_or_create(
                user=user, course=course,
                defaults={'template': tmpl}
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} certificates'))
