import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.payments.models import MembershipPlan, Order
from apps.courses.models import Course

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed sample payment data'

    def handle(self, *args, **options):
        plans = [
            {'name': 'Basic Monthly', 'price': 9.99, 'interval': 'monthly', 'features': ['Access to free courses']},
            {'name': 'Pro Yearly', 'price': 99.99, 'interval': 'yearly', 'features': ['All courses', 'Certificates']},
            {'name': 'Lifetime', 'price': 299.99, 'interval': 'lifetime', 'features': ['Everything forever']},
        ]
        for p in plans:
            MembershipPlan.objects.get_or_create(name=p['name'], defaults=p)

        users = list(User.objects.exclude(is_superuser=True).order_by('?')[:10])
        courses = list(Course.objects.all())
        if not users or not courses:
            self.stdout.write(self.style.WARNING('Need users and courses first'))
            return

        statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'pending', 'refunded']
        methods = ['stripe', 'stripe', 'paypal', 'stripe', 'paypal']

        created = 0
        for i in range(10):
            user = users[i % len(users)]
            course = random.choice(courses)
            price = Decimal(str(course.price)) if hasattr(course, 'price') and course.price else Decimal('29.99')
            _, was_created = Order.objects.get_or_create(
                user=user, course=course,
                defaults={
                    'amount': price,
                    'payment_method': random.choice(methods),
                    'status': random.choice(statuses),
                }
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} orders'))
