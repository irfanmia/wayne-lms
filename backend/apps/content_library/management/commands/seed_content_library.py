from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.content_library.models import ReusableLesson, ReusableQuiz, ReusableQuizQuestion, ReusableAssignment

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed content library with sample lessons, quizzes, and assignments'

    def handle(self, *args, **options):
        admin = User.objects.filter(is_superuser=True).first()

        lessons = [
            {'title': 'Variables & Data Types', 'lesson_type': 'video', 'content': '<h2>Variables & Data Types</h2><p>Learn about integers, floats, strings, and booleans in Python.</p>', 'short_description': 'Introduction to Python data types', 'duration_minutes': 25},
            {'title': 'Functions in Python', 'lesson_type': 'text', 'content': '<h2>Functions</h2><p>Define and call functions, understand parameters and return values.</p>', 'short_description': 'Master Python functions', 'duration_minutes': 30},
            {'title': 'CSS Flexbox Deep Dive', 'lesson_type': 'video', 'content': '<h2>Flexbox</h2><p>Master CSS Flexbox layout for responsive designs.</p>', 'short_description': 'CSS Flexbox layout system', 'duration_minutes': 35},
            {'title': 'REST API Basics', 'lesson_type': 'video', 'content': '<h2>REST APIs</h2><p>Understand HTTP methods, endpoints, and JSON data exchange.</p>', 'short_description': 'Building and consuming REST APIs', 'duration_minutes': 40},
            {'title': 'Git & Version Control', 'lesson_type': 'text', 'content': '<h2>Git</h2><p>Learn branching, merging, and collaborative workflows with Git.</p>', 'short_description': 'Version control with Git', 'duration_minutes': 20},
        ]
        for data in lessons:
            ReusableLesson.objects.get_or_create(title=data['title'], defaults={**data, 'created_by': admin})
        self.stdout.write(self.style.SUCCESS(f'Created {len(lessons)} lessons'))

        quizzes_data = [
            {'title': 'Python Basics Quiz', 'description': 'Test your knowledge of Python fundamentals', 'time_limit_minutes': 15, 'passing_percentage': 70},
            {'title': 'JavaScript Fundamentals', 'description': 'Quiz on JS variables, functions, and DOM', 'time_limit_minutes': 20, 'passing_percentage': 60},
            {'title': 'SQL Knowledge Check', 'description': 'Basic SQL queries and database concepts', 'time_limit_minutes': 10, 'passing_percentage': 75},
        ]
        for qdata in quizzes_data:
            quiz, created = ReusableQuiz.objects.get_or_create(title=qdata['title'], defaults={**qdata, 'created_by': admin})
            if created:
                ReusableQuizQuestion.objects.create(quiz=quiz, question_type='single_choice', question_text='What is the output of print(2+3)?', options=['4', '5', '6', '23'], correct_answer={'answer': 1}, points=1, order=1)
                ReusableQuizQuestion.objects.create(quiz=quiz, question_type='true_false', question_text='Python is a compiled language.', options=['True', 'False'], correct_answer={'answer': 1}, points=1, order=2)
        self.stdout.write(self.style.SUCCESS(f'Created {len(quizzes_data)} quizzes'))

        assignments = [
            {'title': 'Portfolio Website', 'assignment_type': 'file_upload', 'instructions': 'Build a personal portfolio website using HTML, CSS, and JavaScript. Include at least 3 sections: About, Projects, and Contact.', 'max_attempts': 3},
            {'title': 'Data Analysis Report', 'assignment_type': 'essay', 'instructions': 'Analyze the provided dataset using pandas and matplotlib. Write a report with at least 3 visualizations and insights.', 'max_attempts': 2},
        ]
        for adata in assignments:
            ReusableAssignment.objects.get_or_create(title=adata['title'], defaults={**adata, 'rubric': [{'criteria': 'Completeness', 'points': 40}, {'criteria': 'Quality', 'points': 30}, {'criteria': 'Creativity', 'points': 30}], 'created_by': admin})
        self.stdout.write(self.style.SUCCESS(f'Created {len(assignments)} assignments'))
