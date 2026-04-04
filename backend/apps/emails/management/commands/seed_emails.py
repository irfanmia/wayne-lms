from django.core.management.base import BaseCommand
from apps.emails.models import EmailTemplate

TEMPLATES = [
    {
        'name': 'Welcome Email', 'slug': 'welcome', 'category': 'auth',
        'subject': 'Welcome to Wayne LMS, {{student_name}}!',
        'variables': ['student_name', 'login_url'],
        'html_body': '<h1>Welcome {{student_name}}!</h1><p>Start your coding journey at <a href="{{login_url}}">Wayne LMS</a>.</p>',
    },
    {
        'name': 'Course Enrollment', 'slug': 'course-enrollment', 'category': 'enrollment',
        'subject': 'You\'re enrolled in {{course_name}}',
        'variables': ['student_name', 'course_name', 'course_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>You have been enrolled in <strong>{{course_name}}</strong>. <a href="{{course_url}}">Start learning</a>.</p>',
    },
    {
        'name': 'Course Completion', 'slug': 'course-completion', 'category': 'completion',
        'subject': 'Congratulations! You completed {{course_name}}',
        'variables': ['student_name', 'course_name', 'certificate_url'],
        'html_body': '<h1>Congratulations {{student_name}}!</h1><p>You completed <strong>{{course_name}}</strong>. <a href="{{certificate_url}}">View Certificate</a>.</p>',
    },
    {
        'name': 'Certificate Issued', 'slug': 'certificate-issued', 'category': 'completion',
        'subject': 'Your certificate for {{course_name}} is ready',
        'variables': ['student_name', 'course_name', 'certificate_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Your certificate for <strong>{{course_name}}</strong> is ready. <a href="{{certificate_url}}">Download</a>.</p>',
    },
    {
        'name': 'Assignment Graded', 'slug': 'assignment-graded', 'category': 'notification',
        'subject': 'Your assignment "{{assignment_title}}" has been graded',
        'variables': ['student_name', 'assignment_title', 'grade', 'feedback_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Your assignment <strong>{{assignment_title}}</strong> received a grade of {{grade}}. <a href="{{feedback_url}}">View feedback</a>.</p>',
    },
    {
        'name': 'Payment Receipt', 'slug': 'payment-receipt', 'category': 'payment',
        'subject': 'Payment receipt for {{course_name}}',
        'variables': ['student_name', 'course_name', 'amount', 'currency', 'receipt_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Payment of {{currency}} {{amount}} for <strong>{{course_name}}</strong> confirmed. <a href="{{receipt_url}}">View receipt</a>.</p>',
    },
    {
        'name': 'Password Reset', 'slug': 'password-reset', 'category': 'auth',
        'subject': 'Reset your Wayne LMS password',
        'variables': ['student_name', 'reset_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Click <a href="{{reset_url}}">here</a> to reset your password. This link expires in 24 hours.</p>',
    },
    {
        'name': 'Abandoned Cart', 'slug': 'abandoned-cart', 'category': 'marketing',
        'subject': 'You left something behind!',
        'variables': ['student_name', 'course_name', 'checkout_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>You left <strong>{{course_name}}</strong> in your cart. <a href="{{checkout_url}}">Complete checkout</a>.</p>',
    },
    {
        'name': 'New Course Available', 'slug': 'new-course', 'category': 'marketing',
        'subject': 'New course: {{course_name}}',
        'variables': ['student_name', 'course_name', 'course_url', 'instructor_name'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Check out <strong>{{course_name}}</strong> by {{instructor_name}}. <a href="{{course_url}}">Enroll now</a>.</p>',
    },
    {
        'name': 'Membership Renewal', 'slug': 'membership-renewal', 'category': 'payment',
        'subject': 'Your membership is expiring soon',
        'variables': ['student_name', 'expiry_date', 'renewal_url'],
        'html_body': '<h1>Hi {{student_name}}</h1><p>Your membership expires on {{expiry_date}}. <a href="{{renewal_url}}">Renew now</a>.</p>',
    },
]


class Command(BaseCommand):
    help = 'Seed default email templates'

    def handle(self, *args, **options):
        for t in TEMPLATES:
            EmailTemplate.objects.get_or_create(slug=t['slug'], defaults=t)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(TEMPLATES)} email templates'))
