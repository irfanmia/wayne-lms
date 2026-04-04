from django.core.management.base import BaseCommand
from apps.roles.models import Role, Permission, RolePermission

PERMISSIONS = [
    ('manage_users', 'Manage Users', 'Administration'),
    ('manage_courses', 'Manage Courses', 'Administration'),
    ('manage_content', 'Manage Content', 'Administration'),
    ('manage_exercises', 'Manage Exercises', 'Administration'),
    ('manage_settings', 'Manage Settings', 'Administration'),
    ('view_analytics', 'View Analytics', 'Insights'),
    ('manage_payments', 'Manage Payments', 'Insights'),
    ('manage_coupons', 'Manage Coupons', 'Commerce'),
    ('manage_bundles', 'Manage Bundles', 'Commerce'),
    ('manage_certificates', 'Manage Certificates', 'Commerce'),
    ('send_emails', 'Send Emails', 'Communication'),
    ('grade_assignments', 'Grade Assignments', 'Teaching'),
    ('create_courses', 'Create Courses', 'Teaching'),
    ('view_enrolled_students', 'View Enrolled Students', 'Teaching'),
    ('enroll_courses', 'Enroll in Courses', 'Student'),
    ('submit_assignments', 'Submit Assignments', 'Student'),
    ('earn_certificates', 'Earn Certificates', 'Student'),
    ('view_progress', 'View Progress', 'Student'),
]

ROLE_PERMS = {
    'Admin': [p[0] for p in PERMISSIONS],
    'Instructor': [
        'manage_courses', 'manage_content', 'manage_exercises',
        'view_analytics', 'manage_certificates', 'send_emails',
        'grade_assignments', 'create_courses', 'view_enrolled_students',
        'enroll_courses', 'submit_assignments', 'earn_certificates', 'view_progress',
    ],
    'Student': ['enroll_courses', 'submit_assignments', 'earn_certificates', 'view_progress'],
}


class Command(BaseCommand):
    help = 'Seed default roles and permissions'

    def handle(self, *args, **options):
        perm_map = {}
        for codename, name, group in PERMISSIONS:
            p, _ = Permission.objects.get_or_create(codename=codename, defaults={'name': name, 'group': group})
            perm_map[codename] = p

        for role_name, codenames in ROLE_PERMS.items():
            role, _ = Role.objects.get_or_create(name=role_name, defaults={'is_system': True, 'description': f'Default {role_name} role'})
            for cn in codenames:
                RolePermission.objects.get_or_create(role=role, permission=perm_map[cn])

        self.stdout.write(self.style.SUCCESS('Seeded roles and permissions'))
