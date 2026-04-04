from django.core.management.base import BaseCommand
from apps.users.models import User
from django.utils import timezone
from datetime import timedelta
import random


USERS = [
    {'username': 'admin', 'email': 'admin@wayne-lms.example.com', 'display_name': 'Admin User', 'is_staff': True, 'is_superuser': True, 'location': 'Dubai, UAE'},
    {'username': 'lisa.park', 'email': 'lisa.park@wayne-lms.example.com', 'display_name': 'Lisa Park', 'is_staff': True, 'bio': 'Senior Python & React Instructor. 10+ years in software engineering.', 'location': 'San Francisco, CA', 'github_url': 'https://github.com/lisapark', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'},
    {'username': 'john.doe', 'email': 'john.doe@wayne-lms.example.com', 'display_name': 'John Doe', 'is_staff': True, 'bio': 'Full-stack developer and educator. Passionate about web technologies.', 'location': 'London, UK', 'github_url': 'https://github.com/johndoe', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'},
    {'username': 'priya.sharma', 'email': 'priya.sharma@wayne-lms.example.com', 'display_name': 'Priya Sharma', 'is_staff': True, 'bio': 'Data Science & ML Instructor. PhD in Computer Science.', 'location': 'Bangalore, India', 'github_url': 'https://github.com/priyasharma', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'},
    {'username': 'ahmed.hassan', 'email': 'ahmed.hassan@example.com', 'display_name': 'Ahmed Hassan', 'bio': 'Computer Science student. Learning Python and web dev.', 'location': 'Dubai, UAE', 'is_pro_member': True, 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed'},
    {'username': 'maria.garcia', 'email': 'maria.garcia@example.com', 'display_name': 'María García', 'bio': 'Frontend developer transitioning to full-stack.', 'location': 'Madrid, Spain', 'preferred_language': 'es', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'},
    {'username': 'fatima.ali', 'email': 'fatima.ali@example.com', 'display_name': 'Fatima Ali', 'bio': 'Aspiring data analyst. Love numbers and patterns.', 'location': 'Abu Dhabi, UAE', 'preferred_language': 'ar', 'is_pro_member': True, 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima'},
    {'username': 'james.wilson', 'email': 'james.wilson@example.com', 'display_name': 'James Wilson', 'bio': 'DevOps engineer learning cloud computing.', 'location': 'New York, USA', 'github_url': 'https://github.com/jameswilson', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'},
    {'username': 'yuki.tanaka', 'email': 'yuki.tanaka@example.com', 'display_name': 'Yuki Tanaka', 'bio': 'Mobile developer interested in React Native.', 'location': 'Tokyo, Japan', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki'},
    {'username': 'omar.khaled', 'email': 'omar.khaled@example.com', 'display_name': 'Omar Khaled', 'bio': 'Fresh graduate exploring AI and machine learning.', 'location': 'Cairo, Egypt', 'preferred_language': 'ar', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar'},
    {'username': 'sarah.johnson', 'email': 'sarah.johnson@example.com', 'display_name': 'Sarah Johnson', 'bio': 'Project manager learning to code.', 'location': 'Toronto, Canada', 'is_pro_member': True, 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'},
    {'username': 'ravi.patel', 'email': 'ravi.patel@example.com', 'display_name': 'Ravi Patel', 'bio': 'Backend developer. Node.js enthusiast.', 'location': 'Mumbai, India', 'github_url': 'https://github.com/ravipatel', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi'},
    {'username': 'ana.costa', 'email': 'ana.costa@example.com', 'display_name': 'Ana Costa', 'bio': 'UX designer learning frontend development.', 'location': 'Lisbon, Portugal', 'preferred_language': 'es', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'},
    {'username': 'khalid.ibrahim', 'email': 'khalid.ibrahim@example.com', 'display_name': 'Khalid Ibrahim', 'bio': 'Cybersecurity student. CTF player.', 'location': 'Riyadh, Saudi Arabia', 'preferred_language': 'ar', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid'},
    {'username': 'emma.brown', 'email': 'emma.brown@example.com', 'display_name': 'Emma Brown', 'bio': 'Teacher transitioning to EdTech.', 'location': 'Sydney, Australia', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'},
    {'username': 'diego.martinez', 'email': 'diego.martinez@example.com', 'display_name': 'Diego Martínez', 'bio': 'Game developer learning Unity and C#.', 'location': 'Mexico City, Mexico', 'preferred_language': 'es', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego'},
    {'username': 'noor.ahmed', 'email': 'noor.ahmed@example.com', 'display_name': 'Noor Ahmed', 'bio': 'Entrepreneur building an ed-tech startup.', 'location': 'Sharjah, UAE', 'preferred_language': 'ar', 'is_pro_member': True, 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noor'},
    {'username': 'chen.wei', 'email': 'chen.wei@example.com', 'display_name': 'Chen Wei', 'bio': 'Full-stack developer. Open source contributor.', 'location': 'Shanghai, China', 'github_url': 'https://github.com/chenwei', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen'},
    {'username': 'lena.muller', 'email': 'lena.muller@example.com', 'display_name': 'Lena Müller', 'bio': 'Data engineer working with big data pipelines.', 'location': 'Berlin, Germany', 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena'},
    {'username': 'suspended.user', 'email': 'suspended@example.com', 'display_name': 'Suspended User', 'bio': 'Account suspended for violation.', 'location': 'Unknown', 'is_active': False, 'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suspended'},
]


class Command(BaseCommand):
    help = 'Seed users with realistic data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete all non-superuser users first')

    def handle(self, *args, **options):
        if options['clear']:
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write('Cleared non-admin users')

        now = timezone.now()
        created = 0

        for i, u in enumerate(USERS):
            username = u.pop('username')
            email = u.pop('email')
            is_active = u.pop('is_active', True)

            if User.objects.filter(username=username).exists():
                self.stdout.write(f'  Skipping {username} (exists)')
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password='student123' if not u.get('is_superuser') else 'admin123',
            )
            user.is_active = is_active
            for k, v in u.items():
                setattr(user, k, v)

            # Stagger join dates over last 90 days
            user.date_joined = now - timedelta(days=random.randint(1, 90))
            if is_active and random.random() > 0.3:
                user.last_login = now - timedelta(hours=random.randint(1, 72))

            user.save()
            created += 1
            self.stdout.write(f'  Created: {username} ({email})')

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} users (total: {User.objects.count()})'))
