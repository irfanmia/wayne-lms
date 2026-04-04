"""Seed sample live classes for existing courses."""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.courses.models import Course
from apps.live_classes.models import LiveClass

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample live classes for existing courses'

    def handle(self, *args, **options):
        instructor = User.objects.filter(is_staff=True).first()
        if not instructor:
            instructor = User.objects.first()
        if not instructor:
            self.stderr.write('No users found. Create a user first.')
            return

        courses = list(Course.objects.all()[:3])
        if not courses:
            self.stderr.write('No courses found. Seed courses first.')
            return

        now = timezone.now()
        samples = [
            # Upcoming / scheduled
            {'title': 'Getting Started Live Session', 'platform': 'google_meet', 'status': 'scheduled',
             'scheduled_at': now + timedelta(days=2, hours=3), 'duration': 60,
             'meeting_url': 'https://meet.google.com/abc-defg-hij'},
            {'title': 'Q&A: Common Mistakes', 'platform': 'zoom', 'status': 'scheduled',
             'scheduled_at': now + timedelta(days=5), 'duration': 45,
             'meeting_url': 'https://zoom.us/j/1234567890'},
            {'title': 'Advanced Topics Deep Dive', 'platform': 'microsoft_teams', 'status': 'scheduled',
             'scheduled_at': now + timedelta(days=7, hours=1), 'duration': 90,
             'meeting_url': 'https://teams.microsoft.com/l/meetup-join/abc123'},
            # Live now
            {'title': 'Office Hours — Ask Anything!', 'platform': 'google_meet', 'status': 'live',
             'scheduled_at': now - timedelta(minutes=15), 'duration': 60,
             'meeting_url': 'https://meet.google.com/xyz-abcd-efg'},
            # Completed with recording
            {'title': 'Introduction & Setup Workshop', 'platform': 'zoom', 'status': 'completed',
             'scheduled_at': now - timedelta(days=3), 'duration': 60,
             'meeting_url': 'https://zoom.us/j/9876543210',
             'recording_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
            {'title': 'Project Walkthrough', 'platform': 'google_meet', 'status': 'completed',
             'scheduled_at': now - timedelta(days=7), 'duration': 90,
             'meeting_url': 'https://meet.google.com/old-meet-xyz',
             'recording_url': 'https://www.youtube.com/watch?v=example123'},
            # Cancelled
            {'title': 'Cancelled Session', 'platform': 'microsoft_teams', 'status': 'cancelled',
             'scheduled_at': now - timedelta(days=1), 'duration': 45,
             'meeting_url': ''},
        ]

        created = 0
        for i, sample in enumerate(samples):
            course = courses[i % len(courses)]
            _, was_created = LiveClass.objects.get_or_create(
                title=sample['title'],
                course=course,
                defaults={
                    'instructor': instructor,
                    'description': f"Live session for {course.title if isinstance(course.title, str) else 'the course'}.",
                    **sample,
                },
            )
            if was_created:
                created += 1

        # --- HTML5 Essentials course live classes (Google Meet) ---
        html_course = Course.objects.filter(slug__icontains='html').first()
        if html_course:
            html_classes = [
                {'title': 'HTML5 Office Hours — Live Now!', 'platform': 'google_meet', 'status': 'live',
                 'scheduled_at': now - timedelta(minutes=20), 'duration': 60,
                 'meeting_url': 'https://meet.google.com/abc-defg-hij'},
                {'title': 'HTML5 Forms & Validation Workshop', 'platform': 'google_meet', 'status': 'scheduled',
                 'scheduled_at': now + timedelta(days=3), 'duration': 60,
                 'meeting_url': 'https://meet.google.com/xyz-uvwx-rst'},
                {'title': 'Building Responsive Layouts Live', 'platform': 'google_meet', 'status': 'scheduled',
                 'scheduled_at': now + timedelta(days=7), 'duration': 90,
                 'meeting_url': 'https://meet.google.com/qrs-tuvw-xyz'},
                {'title': 'HTML5 Semantic Elements Recap', 'platform': 'google_meet', 'status': 'completed',
                 'scheduled_at': now - timedelta(days=5), 'duration': 60,
                 'meeting_url': 'https://meet.google.com/old-html-abc',
                 'recording_url': 'https://www.youtube.com/watch?v=UB1O30fR-EE'},
                {'title': 'Introduction to HTML5 — Getting Started', 'platform': 'google_meet', 'status': 'completed',
                 'scheduled_at': now - timedelta(days=10), 'duration': 45,
                 'meeting_url': 'https://meet.google.com/old-html-intro',
                 'recording_url': 'https://www.youtube.com/watch?v=qz0aGYrrlhU'},
            ]
            for sample in html_classes:
                _, was_created = LiveClass.objects.get_or_create(
                    title=sample['title'],
                    course=html_course,
                    defaults={
                        'instructor': instructor,
                        'description': f"Live session for {html_course.title}.",
                        **sample,
                    },
                )
                if was_created:
                    created += 1
            self.stdout.write(f'  HTML5 course: {html_course.slug}')
        else:
            self.stderr.write('No HTML5 course found.')

        # --- CSS Mastery course live classes (Zoom) ---
        css_course = Course.objects.filter(slug__icontains='css').first()
        if css_course:
            css_classes = [
                {'title': 'CSS Grid & Flexbox Masterclass', 'platform': 'zoom', 'status': 'scheduled',
                 'scheduled_at': now + timedelta(days=2), 'duration': 60,
                 'meeting_url': 'https://zoom.us/j/1234567890'},
                {'title': 'Advanced Animations & Transitions', 'platform': 'zoom', 'status': 'scheduled',
                 'scheduled_at': now + timedelta(days=5), 'duration': 45,
                 'meeting_url': 'https://zoom.us/j/9876543210'},
                {'title': 'CSS Variables & Theming Workshop', 'platform': 'zoom', 'status': 'completed',
                 'scheduled_at': now - timedelta(days=4), 'duration': 60,
                 'meeting_url': 'https://zoom.us/j/5555555555',
                 'recording_url': 'https://www.youtube.com/watch?v=csstheming'},
            ]
            for sample in css_classes:
                _, was_created = LiveClass.objects.get_or_create(
                    title=sample['title'],
                    course=css_course,
                    defaults={
                        'instructor': instructor,
                        'description': f"Live session for {css_course.title}.",
                        **sample,
                    },
                )
                if was_created:
                    created += 1
            self.stdout.write(f'  CSS course: {css_course.slug}')
        else:
            self.stderr.write('No CSS course found.')

        self.stdout.write(self.style.SUCCESS(f'Created {created} live classes.'))
