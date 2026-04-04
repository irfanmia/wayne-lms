"""Extended seed command that seeds ALL features including new MasterStudy-style features."""
import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with comprehensive demo data for all features'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **options):
        self._seed_feature_flags()
        self._seed_certificate_templates()
        self._seed_slides_and_streams()
        self._seed_advanced_quizzes()
        self._seed_groups()
        self._seed_gamification()
        self._seed_bundles()
        self._seed_payments()
        self._seed_drip_content()
        # New features
        self._seed_prerequisites()
        self._seed_free_preview()
        self._seed_multi_instructor()
        self._seed_assignments()
        self._seed_badges()
        self._seed_public_quizzes()
        self._seed_email_templates()
        self._seed_forms()
        self._seed_media()
        self.stdout.write(self.style.SUCCESS('✅ All features seeded!'))

    def _get_instructor(self):
        instructor, _ = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@wayne-lms.example.com',
                'first_name': 'Sarah', 'last_name': 'Chen',
                'is_staff': True,
            }
        )
        instructor.set_password('demo1234')
        instructor.save()
        User.objects.get_or_create(
            username='student',
            defaults={'email': 'student@example.com', 'first_name': 'John', 'last_name': 'Doe'}
        )
        return instructor

    def _seed_feature_flags(self):
        from apps.courses.models import Course
        python = Course.objects.filter(slug='introduction-to-python').first()
        if python:
            python.enable_certificates = True
            python.enable_discussions = True
            python.enable_quizzes = True
            python.enable_points = True
            python.enable_drip = True
            python.enable_prerequisites = True
            python.enable_assignments = True
            python.enable_multi_instructor = True
            python.drip_enabled = True
            python.drip_type = 'sequential'
            python.is_featured = True
            python.what_youll_learn = [
                'Python fundamentals and syntax', 'Control flow and loops',
                'Functions and modules', 'Object-oriented programming',
                'File handling and exceptions',
            ]
            python.save()

        for slug in ['python-django', 'docker-kubernetes']:
            c = Course.objects.filter(slug=slug).first()
            if c:
                c.enable_live_streams = True
                c.enable_group_purchase = True
                c.enable_certificates = True
                c.enable_multi_instructor = True
                c.save()
        self.stdout.write('  ✓ Feature flags set')

    def _seed_certificate_templates(self):
        from apps.certificates.models import CertificateTemplate, Certificate
        from apps.courses.models import Course

        t1, _ = CertificateTemplate.objects.get_or_create(
            name='Classic Gold',
            defaults={
                'background_image': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
                'layout_json': {
                    'student_name': {'x': 50, 'y': 40, 'fontSize': 36, 'color': '#1a1a1a'},
                    'course_name': {'x': 50, 'y': 50, 'fontSize': 24, 'color': '#333'},
                    'date': {'x': 30, 'y': 70, 'fontSize': 16, 'color': '#666'},
                    'instructor': {'x': 70, 'y': 70, 'fontSize': 16, 'color': '#666'},
                    'certificate_id': {'x': 50, 'y': 85, 'fontSize': 12, 'color': '#999'},
                },
                'is_default': True,
            }
        )
        CertificateTemplate.objects.get_or_create(
            name='Modern Blue',
            defaults={
                'background_image': 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200',
                'layout_json': {},
                'is_default': False,
            }
        )
        instructor = self._get_instructor()
        if instructor:
            course = Course.objects.first()
            if course:
                Certificate.objects.get_or_create(user=instructor, course=course, defaults={'template': t1})
        self.stdout.write('  ✓ Certificate templates created')

    def _seed_slides_and_streams(self):
        from apps.courses.models import Course, Lesson
        course = Course.objects.filter(slug='introduction-to-python').first()
        if not course:
            return
        module = course.modules.first()
        if module:
            if not module.lessons.filter(lesson_type='slides').exists():
                Lesson.objects.create(
                    module=module, title={'en': 'Python Overview Slides'}, content={'en': ''},
                    lesson_type='slides',
                    slides_data=[
                        {'title': 'Welcome to Python', 'content': 'Python is a versatile, high-level programming language.', 'image_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800'},
                        {'title': 'Why Python?', 'content': 'Easy to learn, powerful libraries, huge community.', 'image_url': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800'},
                    ],
                    order=99, duration=10,
                )
            if not module.lessons.filter(lesson_type='stream').exists():
                Lesson.objects.create(
                    module=module, title={'en': 'Live Q&A: Python Basics'},
                    content={'en': 'Join the live stream for Q&A.'},
                    lesson_type='stream', stream_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
                    stream_platform='youtube', scheduled_at=timezone.now() + timedelta(days=7),
                    order=100, duration=60,
                )
        self.stdout.write('  ✓ Slides & stream lessons created')

    def _seed_advanced_quizzes(self):
        from apps.courses.models import Course, Quiz
        course = Course.objects.filter(slug='introduction-to-python').first()
        if not course:
            return
        for quiz in Quiz.objects.filter(course=course):
            quiz.time_limit = 15
            quiz.passing_grade = 60
            quiz.max_retakes = 3
            quiz.randomize_questions = True
            quiz.show_correct_answers = True
            quiz.points_per_question = 10
            quiz.save()
        self.stdout.write('  ✓ Advanced quiz settings')

    def _seed_groups(self):
        from apps.courses.models import Course
        from apps.groups.models import Group, GroupMember
        instructor = self._get_instructor()
        course = Course.objects.filter(enable_group_purchase=True).first() or Course.objects.first()
        if not course:
            return
        group, _ = Group.objects.get_or_create(
            name='Acme Corp Python Training',
            defaults={'admin': instructor, 'course': course, 'max_seats': 20}
        )
        for name, email in [('alice', 'alice@example.com'), ('bob', 'bob@example.com'),
                            ('charlie', 'charlie@example.com'), ('diana', 'diana@example.com')]:
            user, _ = User.objects.get_or_create(username=name, defaults={'email': email, 'first_name': name.capitalize()})
            GroupMember.objects.get_or_create(group=group, user=user, defaults={'added_by': instructor})
        self.stdout.write('  ✓ Groups seeded')

    def _seed_gamification(self):
        from apps.gamification.models import PointConfig, PointTransaction, UserPoints
        import random
        configs = [
            ('registered', 50), ('course_purchased', 100), ('quiz_passed', 25),
            ('quiz_perfect', 50), ('lesson_completed', 10),
            ('certificate_earned', 200), ('group_joined', 30),
        ]
        for action, pts in configs:
            PointConfig.objects.update_or_create(action=action, defaults={'points_awarded': pts, 'point_name': 'coins'})
        users = User.objects.all()[:10]
        for user in users:
            up, _ = UserPoints.objects.get_or_create(user=user)
            up.total_points = random.randint(100, 5000)
            up.save()
            for action in random.sample(['lesson_completed', 'quiz_passed', 'registered'], 3):
                PointTransaction.objects.get_or_create(
                    user=user, action=action,
                    defaults={'points': random.randint(10, 100), 'description': f'Earned for {action}'}
                )
        self.stdout.write('  ✓ Gamification seeded')

    def _seed_bundles(self):
        from apps.bundles.models import Bundle
        from apps.courses.models import Course
        courses = Course.objects.all()[:3]
        if courses.count() < 2:
            return
        bundle, created = Bundle.objects.get_or_create(
            slug='python-web-dev-bundle',
            defaults={
                'title': 'Python & Web Development Bundle',
                'description': 'Master Python and web dev.', 'price': 79.99,
                'discount_percent': 30,
                'thumbnail': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600',
            }
        )
        if created:
            bundle.courses.set(courses)

        all_courses = list(Course.objects.all())
        extra_bundles = [
            {'slug': 'devops-mastery-bundle', 'title': 'DevOps Mastery Bundle', 'description': 'Docker, Kubernetes, and CI/CD in one package.', 'price': 99.99, 'discount_percent': 25, 'thumbnail': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600'},
            {'slug': 'fullstack-pro-bundle', 'title': 'Full-Stack Pro Bundle', 'description': 'Frontend + Backend + DevOps. Everything you need.', 'price': 149.99, 'discount_percent': 40, 'thumbnail': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600'},
            {'slug': 'beginner-starter-bundle', 'title': 'Beginner Starter Pack', 'description': 'Perfect starting point for new coders.', 'price': 49.99, 'discount_percent': 20, 'thumbnail': 'https://images.unsplash.com/photo-1515879218367-8466d910auj4?w=600'},
        ]
        for i, bdata in enumerate(extra_bundles):
            b, bc = Bundle.objects.get_or_create(slug=bdata['slug'], defaults=bdata)
            if bc and len(all_courses) >= 2:
                start = (i * 2) % len(all_courses)
                b.courses.set(all_courses[start:start+3] or all_courses[:2])

        self.stdout.write('  ✓ Bundles seeded')

    def _seed_payments(self):
        from apps.analytics.models import Payment, Subscription
        instructor = self._get_instructor()
        for desc, amount in [('Python Course', 49.99), ('Web Dev Bundle', 55.99)]:
            Payment.objects.get_or_create(
                user=instructor, description=desc,
                defaults={'amount': amount, 'payment_method': 'stripe', 'status': 'completed', 'reference_id': str(uuid.uuid4())[:16]}
            )
        Subscription.objects.get_or_create(
            user=instructor,
            defaults={'plan': 'monthly', 'status': 'active', 'expires_at': timezone.now() + timedelta(days=30)}
        )
        self.stdout.write('  ✓ Payments seeded')

    def _seed_drip_content(self):
        from apps.courses.models import Course, Lesson
        course = Course.objects.filter(drip_enabled=True).first()
        if not course:
            return
        lessons = Lesson.objects.filter(module__course=course).order_by('module__order', 'order')
        for i, lesson in enumerate(lessons):
            lesson.requires_previous = True
            lesson.drip_days_after_enrollment = i * 2
            lesson.save()
        self.stdout.write('  ✓ Drip content configured')

    # ─── NEW FEATURES ───

    def _seed_prerequisites(self):
        from apps.courses.models import Course, CoursePrerequisite
        python = Course.objects.filter(slug='introduction-to-python').first()
        django_course = Course.objects.filter(slug='python-django').first()
        docker = Course.objects.filter(slug='docker-kubernetes').first()
        cicd = Course.objects.filter(slug='cicd-pipeline-mastery').first()
        # Django requires Python, CICD requires Docker
        if python and django_course:
            CoursePrerequisite.objects.get_or_create(course=django_course, required_course=python)
        if docker and cicd:
            CoursePrerequisite.objects.get_or_create(course=cicd, required_course=docker)
        self.stdout.write('  ✓ Prerequisites seeded')

    def _seed_free_preview(self):
        from apps.courses.models import Course, Lesson, Module
        for course in Course.objects.all():
            first_module = course.modules.order_by('order').first()
            if first_module:
                first_lesson = first_module.lessons.order_by('order').first()
                if first_lesson:
                    first_lesson.is_free_preview = True
                    first_lesson.save()
        self.stdout.write('  ✓ Free preview lessons set')

    def _seed_multi_instructor(self):
        from apps.courses.models import Course, CourseInstructor
        instructor = self._get_instructor()

        co1, _ = User.objects.get_or_create(
            username='co_instructor1',
            defaults={'email': 'co1@wayne-lms.example.com', 'first_name': 'Ahmed', 'last_name': 'Ali',
                      'bio': 'Senior Python developer with 10 years of experience.'}
        )
        co2, _ = User.objects.get_or_create(
            username='co_instructor2',
            defaults={'email': 'co2@wayne-lms.example.com', 'first_name': 'Maria', 'last_name': 'Garcia',
                      'bio': 'Full-stack engineer specializing in React and Django.'}
        )

        python = Course.objects.filter(slug='introduction-to-python').first()
        if python:
            CourseInstructor.objects.get_or_create(course=python, instructor=co1, defaults={'role': 'co_instructor', 'order': 1})
        django_c = Course.objects.filter(slug='python-django').first()
        if django_c:
            CourseInstructor.objects.get_or_create(course=django_c, instructor=co2, defaults={'role': 'co_instructor', 'order': 1})
        self.stdout.write('  ✓ Multi-instructor seeded')

    def _seed_assignments(self):
        from apps.assignments.models import Assignment
        from apps.courses.models import Course, Lesson
        from django.db import models

        # Delete all existing assignments (clear orphans)
        Assignment.objects.all().delete()

        python = Course.objects.filter(slug='introduction-to-python').first()
        if not python:
            return

        modules = list(python.modules.all().order_by('order'))

        assignment_data = []

        # Module 1: Python Basics — text/essay
        if len(modules) >= 1:
            assignment_data.append((modules[0], {
                'title': 'Why Python? — Essay',
                'description': '<p>Write a 500-word essay explaining why Python has become one of the most popular programming languages. Cover its history, key features (readability, versatility, community), and at least 3 real-world domains where Python excels.</p>',
                'submission_type': 'text',
                'answer_type': 'essay',
                'points': 50,
                'max_attempts': 2,
                'rubric': 'Content accuracy & depth: 20pts\nClarity of writing: 15pts\nReal-world examples: 10pts\nConclusion & personal reflection: 5pts',
            }))

        # Module 2: Control Flow — code/python
        if len(modules) >= 2:
            assignment_data.append((modules[1], {
                'title': 'Build a Number Classifier',
                'description': '<p>Write a Python program that classifies numbers. Given a number, determine if it is positive/negative/zero, even/odd, and whether it is prime.</p>',
                'submission_type': 'code',
                'answer_type': 'code_python',
                'programming_language': 'python',
                'points': 100,
                'max_attempts': 3,
                'auto_grade': True,
                'starter_code': '''def classify_sign(n):
    """Return 'positive', 'negative', or 'zero'."""
    pass


def is_even(n):
    """Return True if n is even, False otherwise."""
    pass


def is_prime(n):
    """Return True if n is a prime number, False otherwise.
    Numbers less than 2 are not prime.
    """
    pass


def classify_number(n):
    """Return a dict with keys: 'sign', 'parity', 'prime'.
    Example: classify_number(7) -> {'sign': 'positive', 'parity': 'odd', 'prime': True}
    """
    pass
''',
                'test_code': '''import pytest
from solution import classify_sign, is_even, is_prime, classify_number

class TestClassifySign:
    def test_positive(self):
        assert classify_sign(5) == 'positive'
        assert classify_sign(100) == 'positive'

    def test_negative(self):
        assert classify_sign(-3) == 'negative'
        assert classify_sign(-100) == 'negative'

    def test_zero(self):
        assert classify_sign(0) == 'zero'

class TestIsEven:
    def test_even(self):
        assert is_even(4) is True
        assert is_even(0) is True
        assert is_even(-2) is True

    def test_odd(self):
        assert is_even(3) is False
        assert is_even(7) is False

class TestIsPrime:
    def test_primes(self):
        assert is_prime(2) is True
        assert is_prime(7) is True
        assert is_prime(13) is True

    def test_not_prime(self):
        assert is_prime(1) is False
        assert is_prime(0) is False
        assert is_prime(4) is False
        assert is_prime(-5) is False

class TestClassifyNumber:
    def test_positive_odd_prime(self):
        result = classify_number(7)
        assert result == {'sign': 'positive', 'parity': 'odd', 'prime': True}

    def test_zero(self):
        result = classify_number(0)
        assert result == {'sign': 'zero', 'parity': 'even', 'prime': False}

    def test_negative_even(self):
        result = classify_number(-4)
        assert result == {'sign': 'negative', 'parity': 'even', 'prime': False}
''',
                'rubric': 'All tests passing: 70pts\nCode quality: 15pts\nEdge cases: 15pts',
            }))

        # Module 3: Functions & Modules — code/python
        if len(modules) >= 3:
            assignment_data.append((modules[2], {
                'title': 'Create Helper Functions',
                'description': '<p>Build a utility module with helper functions for string manipulation and math operations. Each function should be well-documented and handle edge cases.</p>',
                'submission_type': 'code',
                'answer_type': 'code_python',
                'programming_language': 'python',
                'points': 100,
                'max_attempts': 3,
                'auto_grade': True,
                'starter_code': '''def reverse_string(s):
    """Return the reversed version of string s."""
    pass


def count_vowels(s):
    """Return the number of vowels (a, e, i, o, u) in string s (case-insensitive)."""
    pass


def factorial(n):
    """Return n! (factorial of n). Raise ValueError if n < 0."""
    pass


def fibonacci(n):
    """Return a list of the first n Fibonacci numbers.
    fibonacci(0) -> []
    fibonacci(1) -> [0]
    fibonacci(5) -> [0, 1, 1, 2, 3]
    """
    pass


def celsius_to_fahrenheit(celsius):
    """Convert Celsius to Fahrenheit. Return rounded to 1 decimal."""
    pass
''',
                'test_code': '''import pytest
from solution import reverse_string, count_vowels, factorial, fibonacci, celsius_to_fahrenheit

class TestReverseString:
    def test_basic(self):
        assert reverse_string("hello") == "olleh"
    def test_empty(self):
        assert reverse_string("") == ""
    def test_palindrome(self):
        assert reverse_string("racecar") == "racecar"

class TestCountVowels:
    def test_basic(self):
        assert count_vowels("hello") == 2
    def test_all_vowels(self):
        assert count_vowels("aeiou") == 5
    def test_uppercase(self):
        assert count_vowels("HELLO") == 2
    def test_no_vowels(self):
        assert count_vowels("xyz") == 0

class TestFactorial:
    def test_zero(self):
        assert factorial(0) == 1
    def test_five(self):
        assert factorial(5) == 120
    def test_negative(self):
        with pytest.raises(ValueError):
            factorial(-1)

class TestFibonacci:
    def test_zero(self):
        assert fibonacci(0) == []
    def test_one(self):
        assert fibonacci(1) == [0]
    def test_five(self):
        assert fibonacci(5) == [0, 1, 1, 2, 3]
    def test_eight(self):
        assert fibonacci(8) == [0, 1, 1, 2, 3, 5, 8, 13]

class TestCelsius:
    def test_freezing(self):
        assert celsius_to_fahrenheit(0) == 32.0
    def test_boiling(self):
        assert celsius_to_fahrenheit(100) == 212.0
    def test_body(self):
        assert celsius_to_fahrenheit(37) == 98.6
''',
                'rubric': 'All tests passing: 60pts\nCode quality & docstrings: 20pts\nEdge case handling: 20pts',
            }))

        # Module 4: OOP — code/python
        if len(modules) >= 4:
            assignment_data.append((modules[3], {
                'title': 'Build a Class Hierarchy',
                'description': '<p>Design and implement a class hierarchy for a simple library system. Create classes for LibraryItem, Book, DVD, and Magazine with proper inheritance, encapsulation, and polymorphism.</p>',
                'submission_type': 'code',
                'answer_type': 'code_python',
                'programming_language': 'python',
                'points': 150,
                'max_attempts': 3,
                'auto_grade': True,
                'starter_code': '''class LibraryItem:
    """Base class for all library items."""

    def __init__(self, title, item_id):
        """Initialize with title and item_id. Set checked_out to False."""
        pass

    def check_out(self):
        """Mark item as checked out. Raise ValueError if already checked out."""
        pass

    def return_item(self):
        """Mark item as returned. Raise ValueError if not checked out."""
        pass

    def __str__(self):
        """Return string like: 'Title (ID: item_id)'"""
        pass


class Book(LibraryItem):
    """A book in the library."""

    def __init__(self, title, item_id, author, pages):
        pass

    def description(self):
        """Return 'Book: Title by Author, Pages pages'"""
        pass


class DVD(LibraryItem):
    """A DVD in the library."""

    def __init__(self, title, item_id, director, duration_minutes):
        pass

    def description(self):
        """Return 'DVD: Title directed by Director, Duration min'"""
        pass


class Library:
    """A library that manages items."""

    def __init__(self):
        """Initialize with empty items dict."""
        pass

    def add_item(self, item):
        """Add a LibraryItem. Raise ValueError if item_id already exists."""
        pass

    def find_item(self, item_id):
        """Return the item with given id. Raise KeyError if not found."""
        pass

    def get_available(self):
        """Return list of items that are not checked out."""
        pass
''',
                'test_code': '''import pytest
from solution import LibraryItem, Book, DVD, Library

class TestLibraryItem:
    def test_init(self):
        item = LibraryItem("Test", "001")
        assert item.title == "Test"
        assert item.item_id == "001"
        assert item.checked_out is False

    def test_check_out(self):
        item = LibraryItem("Test", "001")
        item.check_out()
        assert item.checked_out is True

    def test_double_checkout(self):
        item = LibraryItem("Test", "001")
        item.check_out()
        with pytest.raises(ValueError):
            item.check_out()

    def test_return(self):
        item = LibraryItem("Test", "001")
        item.check_out()
        item.return_item()
        assert item.checked_out is False

    def test_return_not_checked(self):
        item = LibraryItem("Test", "001")
        with pytest.raises(ValueError):
            item.return_item()

    def test_str(self):
        item = LibraryItem("Test", "001")
        assert str(item) == "Test (ID: 001)"

class TestBook:
    def test_init(self):
        b = Book("Python 101", "B001", "Author", 300)
        assert b.author == "Author"
        assert b.pages == 300

    def test_description(self):
        b = Book("Python 101", "B001", "Guido", 400)
        assert b.description() == "Book: Python 101 by Guido, 400 pages"

    def test_inheritance(self):
        b = Book("Test", "B002", "A", 100)
        assert isinstance(b, LibraryItem)
        b.check_out()
        assert b.checked_out is True

class TestDVD:
    def test_description(self):
        d = DVD("Matrix", "D001", "Wachowski", 136)
        assert d.description() == "DVD: Matrix directed by Wachowski, 136 min"

class TestLibrary:
    def test_add_and_find(self):
        lib = Library()
        b = Book("Test", "001", "A", 100)
        lib.add_item(b)
        assert lib.find_item("001") == b

    def test_duplicate_id(self):
        lib = Library()
        lib.add_item(Book("A", "001", "X", 1))
        with pytest.raises(ValueError):
            lib.add_item(Book("B", "001", "Y", 2))

    def test_not_found(self):
        lib = Library()
        with pytest.raises(KeyError):
            lib.find_item("999")

    def test_available(self):
        lib = Library()
        b1 = Book("A", "001", "X", 1)
        b2 = Book("B", "002", "Y", 2)
        lib.add_item(b1)
        lib.add_item(b2)
        b1.check_out()
        available = lib.get_available()
        assert len(available) == 1
        assert available[0] == b2
''',
                'rubric': 'All tests passing: 80pts\nProper inheritance: 20pts\nEncapsulation: 20pts\nCode quality: 30pts',
            }))

        # Now create assignment lessons and link assignments
        for module, data in assignment_data:
            # Create assignment lesson at end of module
            max_order = module.lessons.aggregate(m=models.Max('order'))['m'] or 0
            lesson, _ = Lesson.objects.get_or_create(
                module=module,
                lesson_type='assignment',
                title={'en': data['title']},
                defaults={
                    'content': {'en': data['description']},
                    'order': max_order + 1,
                    'duration': 30,
                }
            )
            # Create assignment linked to lesson
            Assignment.objects.get_or_create(
                course=python,
                lesson=lesson,
                title=data['title'],
                defaults={
                    'description': data['description'],
                    'submission_type': data.get('submission_type', 'text'),
                    'answer_type': data.get('answer_type', 'essay'),
                    'programming_language': data.get('programming_language', ''),
                    'points': data.get('points', 50),
                    'max_attempts': data.get('max_attempts', 2),
                    'auto_grade': data.get('auto_grade', False),
                    'starter_code': data.get('starter_code', ''),
                    'test_code': data.get('test_code', ''),
                    'rubric': data.get('rubric', ''),
                    'due_date': timezone.now() + timedelta(days=14 + len(assignment_data) * 7),
                }
            )

        self.stdout.write(f'  ✓ Assignments seeded ({len(assignment_data)} module-linked)')

    def _seed_badges(self):
        from apps.gamification.models import Badge, UserBadge
        badges_data = [
            ('first-steps', 'First Steps', 'Complete your first course', 'first_course', '🎯'),
            ('quiz-master', 'Quiz Master', 'Pass your first quiz', 'first_quiz', '🧠'),
            ('perfect-score', 'Perfect Score', 'Get 100% on a quiz', 'perfect_quiz', '💯'),
            ('course-completer', 'Course Completer', 'Complete a full course', 'first_course', '🏅'),
            ('five-courses', 'Knowledge Seeker', 'Complete 5 courses', 'five_courses', '📚'),
            ('streak-7', 'Streak Master', 'Maintain a 7-day streak', 'streak_7_days', '🔥'),
            ('assignment-hero', 'Assignment Hero', 'Submit your first assignment', 'first_assignment', '📝'),
            ('social-learner', 'Social Learner', 'Participate in discussions', 'social_learner', '💬'),
        ]
        for slug, name, desc, criteria, icon in badges_data:
            Badge.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc, 'criteria_type': criteria, 'icon_url': icon}
            )

        # Award some badges to the student
        student = User.objects.filter(username='student').first()
        if student:
            for slug in ['first-steps', 'quiz-master']:
                badge = Badge.objects.filter(slug=slug).first()
                if badge:
                    UserBadge.objects.get_or_create(user=student, badge=badge)
        self.stdout.write('  ✓ Badges seeded')

    def _seed_public_quizzes(self):
        from apps.courses.models import Quiz
        quizzes = Quiz.objects.filter(quiz_type='module_quiz')[:2]
        for i, quiz in enumerate(quizzes):
            quiz.is_public = True
            quiz.standalone_slug = f'public-quiz-{i+1}'
            quiz.save()
        self.stdout.write('  ✓ Public quizzes seeded')

    def _seed_email_templates(self):
        from apps.notifications.models import EmailTemplate
        templates = [
            ('welcome', 'Welcome Email', 'Welcome to Wayne LMS!',
             'Hi {{student_name}},\n\nWelcome to Wayne LMS! Start learning today.\n\nBest regards,\nThe Wayne LMS Team'),
            ('enrollment', 'Course Enrollment', 'You\'re enrolled in {{course_name}}!',
             'Hi {{student_name}},\n\nYou\'ve been enrolled in {{course_name}}. Start learning now!\n\nHappy learning!'),
            ('lesson_complete', 'Lesson Complete', 'Great progress on {{course_name}}!',
             'Hi {{student_name}},\n\nYou completed a lesson in {{course_name}}. Keep going!'),
            ('quiz_passed', 'Quiz Passed', 'Congratulations on passing the quiz!',
             'Hi {{student_name}},\n\nYou passed the quiz in {{course_name}} on {{date}}. Well done!'),
            ('certificate_issued', 'Certificate Issued', 'Your certificate for {{course_name}}',
             'Hi {{student_name}},\n\nCongratulations! Your certificate for {{course_name}} is ready.'),
            ('assignment_graded', 'Assignment Graded', 'Your assignment has been graded',
             'Hi {{student_name}},\n\nYour assignment in {{course_name}} has been graded. Check your results!'),
        ]
        for trigger, name, subject, body in templates:
            EmailTemplate.objects.get_or_create(
                slug=trigger,
                defaults={'name': name, 'subject': subject, 'body': body, 'trigger': trigger}
            )
        self.stdout.write('  ✓ Email templates seeded')

    def _seed_forms(self):
        from apps.lmsforms.models import LMSForm, FormField
        reg, created = LMSForm.objects.get_or_create(form_type='registration', defaults={'name': 'Registration Form'})
        if created:
            for i, (name, label, ftype, req, opts) in enumerate([
                ('full_name', 'Full Name', 'text', True, []),
                ('email', 'Email Address', 'email', True, []),
                ('phone', 'Phone Number', 'text', False, []),
                ('interests', 'Interests', 'checkbox', False, ['Python', 'JavaScript', 'Data Science', 'Web Dev', 'Mobile']),
            ]):
                FormField.objects.create(
                    form=reg, field_name=name, field_label=label,
                    field_type=ftype, required=req, order=i, options=opts,
                )

        fb, created = LMSForm.objects.get_or_create(form_type='feedback', defaults={'name': 'Feedback Form'})
        if created:
            for i, (name, label, ftype, req, opts) in enumerate([
                ('rating', 'Overall Rating', 'select', True, ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent']),
                ('feedback', 'Your Feedback', 'textarea', True, []),
                ('recommend', 'Would you recommend?', 'radio', False, ['Yes', 'No', 'Maybe']),
            ]):
                FormField.objects.create(
                    form=fb, field_name=name, field_label=label,
                    field_type=ftype, required=req, order=i, options=opts,
                )
        self.stdout.write('  ✓ Forms seeded')

    def _seed_media(self):
        from apps.media_manager.models import MediaFile
        instructor = self._get_instructor()
        placeholders = [
            ('course-thumbnail.jpg', 'image', 'image/jpeg', 125000),
            ('python-intro.mp4', 'video', 'video/mp4', 52000000),
            ('syllabus.pdf', 'document', 'application/pdf', 450000),
        ]
        for fname, ftype, mime, size in placeholders:
            MediaFile.objects.get_or_create(
                filename=fname, uploaded_by=instructor,
                defaults={'file_type': ftype, 'mime_type': mime, 'size_bytes': size, 'folder': 'course-assets'}
            )
        self.stdout.write('  ✓ Media files seeded')
