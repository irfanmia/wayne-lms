from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Category, Course, Module, Lesson
from tracks.models import Track, Concept, Exercise
from accounts.models import Badge, MembershipPlan

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Create instructor
        instructor, _ = User.objects.get_or_create(
            username='instructor',
            defaults={'email': 'instructor@wayne-lms.example.com', 'first_name': 'Sarah',
                      'last_name': 'Chen', 'is_instructor': True, 'bio': 'Senior developer & educator'}
        )

        # Categories
        categories_data = [
            {'name': 'Web Development', 'slug': 'web-development', 'icon': '🌐'},
            {'name': 'Mobile Development', 'slug': 'mobile-development', 'icon': '📱'},
            {'name': 'Data Science', 'slug': 'data-science', 'icon': '📊'},
            {'name': 'DevOps', 'slug': 'devops', 'icon': '⚙️'},
            {'name': 'AI & Machine Learning', 'slug': 'ai-ml', 'icon': '🤖'},
            {'name': 'Cybersecurity', 'slug': 'cybersecurity', 'icon': '🔒'},
        ]
        categories = {}
        for c in categories_data:
            cat, _ = Category.objects.get_or_create(slug=c['slug'], defaults=c)
            categories[c['slug']] = cat

        # Courses
        courses_data = [
            {'title': 'Complete Web Development Bootcamp', 'slug': 'web-dev-bootcamp',
             'description': 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive bootcamp.',
             'category': categories['web-development'], 'instructor': instructor,
             'level': 'beginner', 'price_type': 'free', 'is_featured': True},
            {'title': 'React - The Complete Guide', 'slug': 'react-complete-guide',
             'description': 'Master React including Hooks, Redux, React Router and Next.js.',
             'category': categories['web-development'], 'instructor': instructor,
             'level': 'intermediate', 'price_type': 'paid', 'price': 49.99, 'is_featured': True},
            {'title': 'Python for Data Science', 'slug': 'python-data-science',
             'description': 'Learn Python programming for data analysis, visualization and machine learning.',
             'category': categories['data-science'], 'instructor': instructor,
             'level': 'beginner', 'price_type': 'free', 'is_featured': True},
            {'title': 'Flutter & Dart - Complete App Development', 'slug': 'flutter-dart',
             'description': 'Build beautiful native mobile apps with Flutter and Dart.',
             'category': categories['mobile-development'], 'instructor': instructor,
             'level': 'intermediate', 'price_type': 'paid', 'price': 39.99},
            {'title': 'Docker & Kubernetes Masterclass', 'slug': 'docker-kubernetes',
             'description': 'Learn containerization and orchestration from scratch.',
             'category': categories['devops'], 'instructor': instructor,
             'level': 'intermediate', 'price_type': 'members'},
            {'title': 'Machine Learning A-Z', 'slug': 'machine-learning-az',
             'description': 'Learn to create machine learning algorithms in Python and R.',
             'category': categories['ai-ml'], 'instructor': instructor,
             'level': 'advanced', 'price_type': 'paid', 'price': 59.99, 'is_featured': True},
            {'title': 'JavaScript Algorithms & Data Structures', 'slug': 'js-algorithms',
             'description': 'Master coding interviews with JS algorithms and data structures.',
             'category': categories['web-development'], 'instructor': instructor,
             'level': 'intermediate', 'price_type': 'free'},
            {'title': 'Ethical Hacking & Penetration Testing', 'slug': 'ethical-hacking',
             'description': 'Learn cybersecurity, ethical hacking and penetration testing.',
             'category': categories['cybersecurity'], 'instructor': instructor,
             'level': 'advanced', 'price_type': 'paid', 'price': 69.99},
        ]
        for cd in courses_data:
            course, created = Course.objects.get_or_create(slug=cd['slug'], defaults=cd)
            if created:
                # Add modules and lessons
                for i in range(1, 4):
                    module = Module.objects.create(course=course, title=f'Module {i}: Getting Started' if i == 1 else f'Module {i}', order=i)
                    for j in range(1, 5):
                        Lesson.objects.create(
                            module=module, title=f'Lesson {j}',
                            lesson_type='video' if j % 2 == 0 else 'text',
                            duration_minutes=10 + j * 5, order=j
                        )

        # Tracks
        tracks_data = [
            {'name': 'Python', 'slug': 'python', 'description': 'Learn Python from basics to advanced.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
             'difficulty': 'beginner', 'is_featured': True, 'student_count': 45200},
            {'name': 'JavaScript', 'slug': 'javascript', 'description': 'Master JavaScript fundamentals and beyond.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
             'difficulty': 'beginner', 'is_featured': True, 'student_count': 52100},
            {'name': 'TypeScript', 'slug': 'typescript', 'description': 'Type-safe JavaScript development.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
             'difficulty': 'intermediate', 'is_featured': True, 'student_count': 28300},
            {'name': 'Rust', 'slug': 'rust', 'description': 'Systems programming with safety and performance.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
             'difficulty': 'advanced', 'is_featured': True, 'student_count': 15800},
            {'name': 'Go', 'slug': 'go', 'description': 'Build scalable and efficient applications.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
             'difficulty': 'intermediate', 'student_count': 21400},
            {'name': 'Java', 'slug': 'java', 'description': 'Enterprise-grade application development.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
             'difficulty': 'intermediate', 'student_count': 38900},
            {'name': 'C++', 'slug': 'cpp', 'description': 'High-performance systems programming.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
             'difficulty': 'advanced', 'student_count': 19200},
            {'name': 'Ruby', 'slug': 'ruby', 'description': 'Elegant and productive programming.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
             'difficulty': 'beginner', 'student_count': 12600},
            {'name': 'Swift', 'slug': 'swift', 'description': 'Build iOS and macOS applications.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
             'difficulty': 'intermediate', 'student_count': 16700},
            {'name': 'Kotlin', 'slug': 'kotlin', 'description': 'Modern Android development.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
             'difficulty': 'intermediate', 'student_count': 14300},
            {'name': 'C#', 'slug': 'csharp', 'description': '.NET and game development with Unity.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
             'difficulty': 'intermediate', 'student_count': 25100},
            {'name': 'PHP', 'slug': 'php', 'description': 'Server-side web development.',
             'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
             'difficulty': 'beginner', 'student_count': 18400},
        ]
        for td in tracks_data:
            track, created = Track.objects.get_or_create(slug=td['slug'], defaults=td)
            if created:
                # Add concepts and exercises
                concepts_names = ['Basics', 'Control Flow', 'Functions', 'Data Structures']
                for i, cn in enumerate(concepts_names):
                    concept = Concept.objects.create(track=track, name=cn, slug=cn.lower().replace(' ', '-'), order=i)
                    for j in range(1, 4):
                        Exercise.objects.create(
                            track=track, concept=concept,
                            title=f'{cn} Exercise {j}', slug=f'{cn.lower().replace(" ", "-")}-ex-{j}',
                            description=f'Practice {cn.lower()} concepts.',
                            instructions=f'Complete the {cn.lower()} exercise.',
                            difficulty=['easy', 'medium', 'hard'][j - 1],
                            exercise_type='learning' if j == 1 else 'practice',
                            starter_code=f'# Write your code here\n',
                            test_code=f'# Tests\nassert True',
                            solution_code=f'# Solution\npass',
                            order=j,
                        )

        # Badges
        badges_data = [
            {'name': 'First Steps', 'description': 'Complete your first exercise', 'icon': '🎯'},
            {'name': 'Streak Master', 'description': '7-day learning streak', 'icon': '🔥'},
            {'name': 'Problem Solver', 'description': 'Solve 50 exercises', 'icon': '🧩'},
            {'name': 'Course Complete', 'description': 'Complete your first course', 'icon': '🎓'},
            {'name': 'Contributor', 'description': 'Publish a community solution', 'icon': '💡'},
        ]
        for bd in badges_data:
            Badge.objects.get_or_create(name=bd['name'], defaults=bd)

        # Membership Plans
        plans_data = [
            {'name': 'Free', 'price_monthly': 0, 'price_yearly': 0,
             'features': ['Access to free courses', 'Basic exercises', 'Community forum']},
            {'name': 'Pro', 'price_monthly': 19.99, 'price_yearly': 199.99, 'is_popular': True,
             'features': ['All courses', 'All exercises', 'Certificates', 'Priority support', 'No ads']},
            {'name': 'Teams', 'price_monthly': 49.99, 'price_yearly': 499.99,
             'features': ['Everything in Pro', 'Team management', 'Analytics dashboard', 'Custom tracks', 'API access']},
        ]
        for pd in plans_data:
            MembershipPlan.objects.get_or_create(name=pd['name'], defaults=pd)

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
