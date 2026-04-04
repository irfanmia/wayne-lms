import json
import os
from django.core.management.base import BaseCommand
from apps.tracks.models import Track, Concept, Exercise
from apps.courses.models import Course, Module, Lesson, Quiz, Question, Choice

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'src', 'data')


def load_json(name):
    path = os.path.normpath(os.path.join(DATA_DIR, name))
    with open(path) as f:
        return json.load(f)


# ── Exercise data per track (real working code) ──────────────────────────
EXERCISE_CODE = {
    'python': {
        'hello-world': {
            'starter': 'def hello():\n    pass\n',
            'test': 'from solution import hello\nassert hello() == "Hello, World!", f"Expected \'Hello, World!\' but got \'{hello()}\'"\nprint("All tests passed!")\n',
            'solution': 'def hello():\n    return "Hello, World!"\n',
        },
        'two-fer': {
            'starter': 'def two_fer(name="you"):\n    pass\n',
            'test': 'from solution import two_fer\nassert two_fer() == "One for you, one for me."\nassert two_fer("Alice") == "One for Alice, one for me."\nassert two_fer("Bob") == "One for Bob, one for me."\nprint("All tests passed!")\n',
            'solution': 'def two_fer(name="you"):\n    return f"One for {name}, one for me."\n',
        },
        'resistor-color': {
            'starter': 'COLORS = []\n\ndef color_code(color):\n    pass\n',
            'test': 'from solution import color_code\nassert color_code("black") == 0\nassert color_code("white") == 9\nassert color_code("orange") == 3\nprint("All tests passed!")\n',
            'solution': 'COLORS = ["black","brown","red","orange","yellow","green","blue","violet","grey","white"]\n\ndef color_code(color):\n    return COLORS.index(color)\n',
        },
        'leap': {
            'starter': 'def leap_year(year):\n    pass\n',
            'test': 'from solution import leap_year\nassert leap_year(2000) == True\nassert leap_year(1900) == False\nassert leap_year(2024) == True\nassert leap_year(2023) == False\nassert leap_year(1996) == True\nprint("All tests passed!")\n',
            'solution': 'def leap_year(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)\n',
        },
        'isogram': {
            'starter': 'def is_isogram(string):\n    pass\n',
            'test': 'from solution import is_isogram\nassert is_isogram("lumberjacks") == True\nassert is_isogram("background") == True\nassert is_isogram("downstream") == True\nassert is_isogram("six-year-old") == True\nassert is_isogram("isograms") == False\nprint("All tests passed!")\n',
            'solution': 'def is_isogram(string):\n    s = string.lower().replace("-", "").replace(" ", "")\n    return len(s) == len(set(s))\n',
        },
        'bob': {
            'starter': 'def response(hey_bob):\n    pass\n',
            'test': 'from solution import response\nassert response("Tom-ay-to, tom-ah-to.") == "Whatever."\nassert response("WATCH OUT!") == "Whoa, chill out!"\nassert response("Does this celi charger work?") == "Sure."\nassert response("") == "Fine. Be that way!"\nprint("All tests passed!")\n',
            'solution': 'def response(hey_bob):\n    s = hey_bob.strip()\n    if not s:\n        return "Fine. Be that way!"\n    is_yelling = s.upper() == s and s.lower() != s\n    is_question = s.endswith("?")\n    if is_yelling and is_question:\n        return "Calm down, I know what I\'m doing!"\n    if is_yelling:\n        return "Whoa, chill out!"\n    if is_question:\n        return "Sure."\n    return "Whatever."\n',
        },
        'pangram': {
            'starter': 'def is_pangram(sentence):\n    pass\n',
            'test': 'from solution import is_pangram\nassert is_pangram("The quick brown fox jumps over the lazy dog") == True\nassert is_pangram("Five boxing wizards jump quickly") == True\nassert is_pangram("Hello World") == False\nprint("All tests passed!")\n',
            'solution': 'def is_pangram(sentence):\n    return set("abcdefghijklmnopqrstuvwxyz").issubset(set(sentence.lower()))\n',
        },
        'matrix': {
            'starter': 'class Matrix:\n    def __init__(self, matrix_string):\n        pass\n\n    def row(self, index):\n        pass\n\n    def column(self, index):\n        pass\n',
            'test': 'from solution import Matrix\nm = Matrix("1 2 3\\n4 5 6\\n7 8 9")\nassert m.row(1) == [1, 2, 3]\nassert m.row(2) == [4, 5, 6]\nassert m.column(1) == [1, 4, 7]\nassert m.column(3) == [3, 6, 9]\nprint("All tests passed!")\n',
            'solution': 'class Matrix:\n    def __init__(self, matrix_string):\n        self.rows = [[int(n) for n in row.split()] for row in matrix_string.strip().split("\\n")]\n\n    def row(self, index):\n        return self.rows[index - 1]\n\n    def column(self, index):\n        return [row[index - 1] for row in self.rows]\n',
        },
        'binary-search': {
            'starter': 'def find(search_list, value):\n    pass\n',
            'test': 'from solution import find\nassert find([1, 3, 5, 8, 13, 21, 34, 55, 89, 144], 21) == 5\nassert find([1, 3, 5, 8, 13, 21, 34, 55, 89, 144], 1) == 0\nassert find([1, 3, 5, 8, 13, 21, 34, 55, 89, 144], 144) == 9\ntry:\n    find([1, 3, 5], 2)\n    assert False, "Should raise ValueError"\nexcept ValueError:\n    pass\nprint("All tests passed!")\n',
            'solution': 'def find(search_list, value):\n    low, high = 0, len(search_list) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if search_list[mid] == value:\n            return mid\n        elif search_list[mid] < value:\n            low = mid + 1\n        else:\n            high = mid - 1\n    raise ValueError("value not in array")\n',
        },
        'linked-list': {
            'starter': 'class Node:\n    def __init__(self, value, next_node=None):\n        pass\n\nclass LinkedList:\n    def __init__(self):\n        pass\n\n    def push(self, value):\n        pass\n\n    def pop(self):\n        pass\n\n    def __len__(self):\n        pass\n',
            'test': 'from solution import LinkedList\nll = LinkedList()\nll.push(1)\nll.push(2)\nll.push(3)\nassert len(ll) == 3\nassert ll.pop() == 3\nassert ll.pop() == 2\nassert len(ll) == 1\nprint("All tests passed!")\n',
            'solution': 'class Node:\n    def __init__(self, value, next_node=None):\n        self.value = value\n        self.next_node = next_node\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n        self.length = 0\n\n    def push(self, value):\n        self.head = Node(value, self.head)\n        self.length += 1\n\n    def pop(self):\n        if self.head is None:\n            raise IndexError("List is empty")\n        value = self.head.value\n        self.head = self.head.next_node\n        self.length -= 1\n        return value\n\n    def __len__(self):\n        return self.length\n',
        },
    },
    'javascript': {
        'hello-world': {
            'starter': '// Returns a greeting\nexport function hello() {\n  // your code here\n}\n',
            'test': 'const { hello } = require("./solution");\nconsole.assert(hello() === "Hello, World!", `Expected "Hello, World!" but got "${hello()}"`);\nconsole.log("All tests passed!");\n',
            'solution': 'export function hello() {\n  return "Hello, World!";\n}\n',
        },
        'lucians-luscious-lasagna': {
            'starter': 'export const EXPECTED_MINUTES_IN_OVEN = 0;\n\nexport function remainingMinutesInOven(actualMinutes) {\n  // your code here\n}\n\nexport function preparationTimeInMinutes(layers) {\n  // your code here\n}\n\nexport function totalTimeInMinutes(layers, actualMinutes) {\n  // your code here\n}\n',
            'test': 'const m = require("./solution");\nconsole.assert(m.EXPECTED_MINUTES_IN_OVEN === 40);\nconsole.assert(m.remainingMinutesInOven(30) === 10);\nconsole.assert(m.preparationTimeInMinutes(2) === 4);\nconsole.assert(m.totalTimeInMinutes(3, 20) === 26);\nconsole.log("All tests passed!");\n',
            'solution': 'export const EXPECTED_MINUTES_IN_OVEN = 40;\n\nexport function remainingMinutesInOven(actualMinutes) {\n  return EXPECTED_MINUTES_IN_OVEN - actualMinutes;\n}\n\nexport function preparationTimeInMinutes(layers) {\n  return layers * 2;\n}\n\nexport function totalTimeInMinutes(layers, actualMinutes) {\n  return preparationTimeInMinutes(layers) + actualMinutes;\n}\n',
        },
    },
}

# Generic exercises for tracks without specific code
GENERIC_EXERCISES = {
    'java': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World', 'ar': 'مرحبا بالعالم', 'es': 'Hola Mundo'}, 'difficulty': 'easy',
         'starter': 'public class Greeting {\n    public static String hello() {\n        return "";\n    }\n}\n',
         'test': 'public class Test {\n    public static void main(String[] args) {\n        assert Greeting.hello().equals("Hello, World!");\n        System.out.println("All tests passed!");\n    }\n}\n',
         'solution': 'public class Greeting {\n    public static String hello() {\n        return "Hello, World!";\n    }\n}\n'},
        {'slug': 'two-fer', 'title': {'en': 'Two Fer', 'ar': 'اثنان مقابل', 'es': 'Dos Por'}, 'difficulty': 'easy',
         'starter': 'public class Twofer {\n    public static String twofer(String name) {\n        return "";\n    }\n}\n',
         'test': 'public class Test {\n    public static void main(String[] args) {\n        assert Twofer.twofer("Alice").equals("One for Alice, one for me.");\n        System.out.println("All tests passed!");\n    }\n}\n',
         'solution': 'public class Twofer {\n    public static String twofer(String name) {\n        return "One for " + (name == null ? "you" : name) + ", one for me.";\n    }\n}\n'},
    ],
    'typescript': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'export function hello(): string {\n  // your code here\n  return "";\n}\n',
         'test': 'import { hello } from "./solution";\nconsole.assert(hello() === "Hello, World!");\nconsole.log("All tests passed!");\n',
         'solution': 'export function hello(): string {\n  return "Hello, World!";\n}\n'},
        {'slug': 'two-fer', 'title': {'en': 'Two Fer'}, 'difficulty': 'easy',
         'starter': 'export function twofer(name: string = "you"): string {\n  return "";\n}\n',
         'test': 'import { twofer } from "./solution";\nconsole.assert(twofer() === "One for you, one for me.");\nconsole.assert(twofer("Alice") === "One for Alice, one for me.");\nconsole.log("All tests passed!");\n',
         'solution': 'export function twofer(name: string = "you"): string {\n  return `One for ${name}, one for me.`;\n}\n'},
    ],
    'rust': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'pub fn hello() -> &\'static str {\n    todo!()\n}\n',
         'test': 'use solution::hello;\nfn main() {\n    assert_eq!(hello(), "Hello, World!");\n    println!("All tests passed!");\n}\n',
         'solution': 'pub fn hello() -> &\'static str {\n    "Hello, World!"\n}\n'},
        {'slug': 'leap', 'title': {'en': 'Leap'}, 'difficulty': 'easy',
         'starter': 'pub fn is_leap_year(year: u64) -> bool {\n    todo!()\n}\n',
         'test': 'use solution::is_leap_year;\nfn main() {\n    assert!(is_leap_year(2000));\n    assert!(!is_leap_year(1900));\n    println!("All tests passed!");\n}\n',
         'solution': 'pub fn is_leap_year(year: u64) -> bool {\n    year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)\n}\n'},
    ],
    'go': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'package greeting\n\nfunc HelloWorld() string {\n\treturn ""\n}\n',
         'test': 'package greeting\nimport "testing"\nfunc TestHelloWorld(t *testing.T) {\n\tif HelloWorld() != "Hello, World!" {\n\t\tt.Fatal("wrong")\n\t}\n}\n',
         'solution': 'package greeting\n\nfunc HelloWorld() string {\n\treturn "Hello, World!"\n}\n'},
        {'slug': 'two-fer', 'title': {'en': 'Two Fer'}, 'difficulty': 'easy',
         'starter': 'package twofer\n\nfunc ShareWith(name string) string {\n\treturn ""\n}\n',
         'test': 'package twofer\nimport "testing"\nfunc TestShareWith(t *testing.T) {\n\tif ShareWith("Alice") != "One for Alice, one for me." {\n\t\tt.Fatal("wrong")\n\t}\n}\n',
         'solution': 'package twofer\nimport "fmt"\n\nfunc ShareWith(name string) string {\n\tif name == "" {\n\t\tname = "you"\n\t}\n\treturn fmt.Sprintf("One for %s, one for me.", name)\n}\n'},
    ],
    'csharp': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'public static class HelloWorld\n{\n    public static string Hello() => throw new NotImplementedException();\n}\n',
         'test': 'using Xunit;\npublic class HelloWorldTests\n{\n    [Fact]\n    public void Say_hi() => Assert.Equal("Hello, World!", HelloWorld.Hello());\n}\n',
         'solution': 'public static class HelloWorld\n{\n    public static string Hello() => "Hello, World!";\n}\n'},
    ],
    'cpp': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': '#include <string>\nnamespace hello_world {\n    std::string hello() {\n        return "";\n    }\n}\n',
         'test': '#include <cassert>\n#include "solution.h"\nint main() {\n    assert(hello_world::hello() == "Hello, World!");\n    return 0;\n}\n',
         'solution': '#include <string>\nnamespace hello_world {\n    std::string hello() {\n        return "Hello, World!";\n    }\n}\n'},
    ],
    'ruby': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'class HelloWorld\n  def self.hello\n    # your code here\n  end\nend\n',
         'test': 'require_relative "solution"\nraise unless HelloWorld.hello == "Hello, World!"\nputs "All tests passed!"\n',
         'solution': 'class HelloWorld\n  def self.hello\n    "Hello, World!"\n  end\nend\n'},
        {'slug': 'two-fer', 'title': {'en': 'Two Fer'}, 'difficulty': 'easy',
         'starter': 'class TwoFer\n  def self.two_fer(name = "you")\n    # your code here\n  end\nend\n',
         'test': 'require_relative "solution"\nraise unless TwoFer.two_fer == "One for you, one for me."\nraise unless TwoFer.two_fer("Alice") == "One for Alice, one for me."\nputs "All tests passed!"\n',
         'solution': 'class TwoFer\n  def self.two_fer(name = "you")\n    "One for #{name}, one for me."\n  end\nend\n'},
    ],
    'swift': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'func hello() -> String {\n    return ""\n}\n',
         'test': 'assert(hello() == "Hello, World!")\nprint("All tests passed!")\n',
         'solution': 'func hello() -> String {\n    return "Hello, World!"\n}\n'},
    ],
    'kotlin': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': 'fun hello(): String {\n    return ""\n}\n',
         'test': 'fun main() {\n    assert(hello() == "Hello, World!")\n    println("All tests passed!")\n}\n',
         'solution': 'fun hello(): String {\n    return "Hello, World!"\n}\n'},
    ],
    'sql': [
        {'slug': 'hello-world', 'title': {'en': 'Hello World'}, 'difficulty': 'easy',
         'starter': "-- Write a query that returns 'Hello, World!'\nSELECT '' AS greeting;\n",
         'test': "-- Expected: Hello, World!\n",
         'solution': "SELECT 'Hello, World!' AS greeting;\n"},
    ],
}


class Command(BaseCommand):
    help = 'Seed the database with data matching frontend JSON files'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        if options.get('clear'):
            self.stdout.write('Clearing existing data...')
            Choice.objects.all().delete()
            Question.objects.all().delete()
            Quiz.objects.all().delete()
            Exercise.objects.all().delete()
            Concept.objects.all().delete()
            Track.objects.all().delete()
            Lesson.objects.all().delete()
            Module.objects.all().delete()
            Course.objects.all().delete()

        self._seed_tracks()
        self._seed_courses()
        self._seed_quizzes()
        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))

        # Seed extended features
        from django.core.management import call_command
        try:
            call_command('seed_features')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ⚠ Extended features seed: {e}'))

    def _seed_tracks(self):
        tracks_data = load_json('tracks.json')
        exercises_data = load_json('exercises.json')
        concepts_data = load_json('concepts.json')

        # Build exercise lookup by trackSlug
        exercises_by_track = {}
        for ex in exercises_data:
            exercises_by_track.setdefault(ex['trackSlug'], []).append(ex)

        # Build concept lookup by trackSlug
        concepts_by_track = {}
        for c in concepts_data:
            concepts_by_track.setdefault(c['trackSlug'], []).append(c)

        for i, td in enumerate(tracks_data):
            track, _ = Track.objects.update_or_create(
                slug=td['slug'],
                defaults={
                    'title': {'en': td['name'], 'ar': td['name'], 'es': td['name']},
                    'description': td['description'] if isinstance(td['description'], dict) else {'en': td['description']},
                    'icon_url': td.get('icon', ''),
                    'difficulty_level': td.get('difficulty', 'beginner'),
                    'order': i + 1,
                }
            )

            # Create concepts for this track
            track_concepts = concepts_by_track.get(td['slug'], [])
            concept_map = {}

            if track_concepts:
                for ci, cd in enumerate(track_concepts):
                    concept, _ = Concept.objects.update_or_create(
                        track=track, slug=cd['slug'],
                        defaults={
                            'title': {'en': cd['name']},
                            'description': {'en': f"Learn about {cd['name'].lower()} in {td['name']}"},
                            'order': ci + 1,
                        }
                    )
                    concept_map[cd['slug']] = concept
            else:
                # Create default concepts for tracks without specific concept data
                for ci, cname in enumerate(['Basics', 'Control Flow', 'Functions', 'Data Structures']):
                    cslug = cname.lower().replace(' ', '-')
                    concept, _ = Concept.objects.update_or_create(
                        track=track, slug=cslug,
                        defaults={
                            'title': {'en': cname},
                            'description': {'en': f"Learn about {cname.lower()} in {td['name']}"},
                            'order': ci + 1,
                        }
                    )
                    concept_map[cslug] = concept

            # Create exercises
            track_exercises = exercises_by_track.get(td['slug'], [])
            code_data = EXERCISE_CODE.get(td['slug'], {})
            generic_data = GENERIC_EXERCISES.get(td['slug'], [])
            generic_map = {g['slug']: g for g in generic_data}

            if track_exercises:
                for ei, ed in enumerate(track_exercises):
                    concept_slug = ed.get('concept', 'basics')
                    concept = concept_map.get(concept_slug, list(concept_map.values())[0] if concept_map else None)
                    if not concept:
                        continue

                    cd = code_data.get(ed['slug'], {})
                    gd = generic_map.get(ed['slug'], {})

                    lang = td['slug']
                    starter = cd.get('starter', gd.get('starter', f'# Write your {td["name"]} code here\n'))
                    test = cd.get('test', gd.get('test', '# Tests\n'))
                    solution = cd.get('solution', gd.get('solution', '# Solution\n'))

                    Exercise.objects.update_or_create(
                        concept=concept, slug=ed['slug'],
                        defaults={
                            'title': {'en': ed['name']} if isinstance(ed.get('name'), str) else ed.get('title', {'en': ed['slug']}),
                            'description': ed.get('description', {'en': ''}),
                            'difficulty': ed.get('difficultyKey', 'easy'),
                            'instructions': {'en': f"Complete the {ed['name']} exercise."},
                            'starter_code': {lang: starter},
                            'test_code': {lang: test},
                            'solution': {lang: solution},
                            'order': ei + 1,
                        }
                    )
            elif generic_data:
                # Use generic exercises for tracks without frontend exercise data
                concept = list(concept_map.values())[0] if concept_map else None
                if not concept:
                    continue
                for ei, gd in enumerate(generic_data):
                    Exercise.objects.update_or_create(
                        concept=concept, slug=gd['slug'],
                        defaults={
                            'title': gd.get('title', {'en': gd['slug']}),
                            'description': {'en': f"Complete the {gd['slug']} exercise."},
                            'difficulty': gd.get('difficulty', 'easy'),
                            'instructions': {'en': f"Complete the {gd['slug']} exercise."},
                            'starter_code': {td['slug']: gd['starter']},
                            'test_code': {td['slug']: gd['test']},
                            'solution': {td['slug']: gd['solution']},
                            'order': ei + 1,
                        }
                    )

        self.stdout.write(self.style.SUCCESS(
            f'  Tracks: {Track.objects.count()} | Concepts: {Concept.objects.count()} | Exercises: {Exercise.objects.count()}'
        ))

    def _seed_courses(self):
        courses_data = load_json('courses.json')

        for cd in courses_data:
            title = cd['title'] if isinstance(cd['title'], dict) else {'en': cd['title']}
            desc = cd['description'] if isinstance(cd['description'], dict) else {'en': cd['description']}

            course, _ = Course.objects.update_or_create(
                slug=cd['slug'],
                defaults={
                    'title': title,
                    'description': desc,
                    'price': cd.get('price', 0),
                    'is_free': cd.get('priceType', 'free') == 'free',
                    'thumbnail': cd.get('thumbnail', ''),
                    'category': cd.get('categorySlug', ''),
                    'duration': 0,
                    'level': cd.get('level', 'beginner').lower(),
                }
            )

            # Create modules and lessons from curriculum
            curriculum = cd.get('curriculum', [])
            for mi, mod in enumerate(curriculum):
                mod_title = mod['title'] if isinstance(mod['title'], dict) else {'en': mod['title']}
                module, _ = Module.objects.update_or_create(
                    course=course, order=mi + 1,
                    defaults={'title': mod_title}
                )

                # Delete existing lessons for idempotency
                module.lessons.all().delete()

                for li, les in enumerate(mod.get('lessons', [])):
                    les_title = les['title'] if isinstance(les['title'], dict) else {'en': les['title']}
                    dur_str = les.get('duration', '0 min')
                    try:
                        dur_min = int(dur_str.split()[0]) if isinstance(dur_str, str) else int(dur_str)
                    except (ValueError, IndexError):
                        dur_min = 10

                    Lesson.objects.create(
                        module=module,
                        title=les_title,
                        content={'en': ''},
                        lesson_type=les.get('type', 'text'),
                        duration=dur_min,
                        order=li + 1,
                    )

        self.stdout.write(self.style.SUCCESS(
            f'  Courses: {Course.objects.count()} | Modules: {Module.objects.count()} | Lessons: {Lesson.objects.count()}'
        ))

    def _seed_quizzes(self):
        """Seed quizzes for the Introduction to Python course."""
        try:
            course = Course.objects.get(slug='introduction-to-python')
        except Course.DoesNotExist:
            self.stdout.write(self.style.WARNING('  No introduction-to-python course found, skipping quizzes'))
            return

        # Delete existing quizzes for this course
        Quiz.objects.filter(course=course).delete()

        # Also add rich content to text/video lessons
        self._enrich_python_lessons(course)

        # Quiz data per module
        module_quizzes = [
            {
                'title': {'en': 'Python Basics Quiz'},
                'questions': [
                    {'text': 'What is Python?', 'choices': ['A snake', 'A programming language', 'A database', 'An operating system'], 'correct': 1, 'explanation': 'Python is a high-level, interpreted programming language.'},
                    {'text': 'Who created Python?', 'choices': ['James Gosling', 'Guido van Rossum', 'Brendan Eich', 'Dennis Ritchie'], 'correct': 1, 'explanation': 'Guido van Rossum created Python in 1991.'},
                    {'text': 'Which keyword is used to define a variable in Python?', 'choices': ['var', 'let', 'No keyword needed', 'define'], 'correct': 2, 'explanation': 'Python uses dynamic typing; no keyword is needed to declare a variable.'},
                    {'text': 'What is the output of print(type(5))?', 'choices': ["<class 'int'>", "<class 'float'>", "<class 'str'>", "5"], 'correct': 0, 'explanation': '5 is an integer literal, so type() returns int.'},
                    {'text': 'Which of these is a valid variable name?', 'choices': ['2name', 'my-var', '_count', 'class'], 'correct': 2, 'explanation': 'Variable names can start with underscore or letter, not digit or hyphen.'},
                    {'text': 'What does the // operator do?', 'choices': ['Division', 'Floor division', 'Modulo', 'Power'], 'correct': 1, 'explanation': '// performs integer/floor division.'},
                    {'text': 'Which data type is immutable?', 'choices': ['list', 'dict', 'set', 'tuple'], 'correct': 3, 'explanation': 'Tuples are immutable sequences.'},
                    {'text': 'How do you create a comment in Python?', 'choices': ['// comment', '/* comment */', '# comment', '-- comment'], 'correct': 2, 'explanation': 'Python uses # for single-line comments.'},
                    {'text': 'What is the result of 3 ** 2?', 'choices': ['6', '9', '5', '1'], 'correct': 1, 'explanation': '** is the exponentiation operator. 3^2 = 9.'},
                    {'text': 'Which function gets user input?', 'choices': ['scan()', 'read()', 'input()', 'get()'], 'correct': 2, 'explanation': 'input() reads a line from stdin.'},
                ],
            },
            {
                'title': {'en': 'Control Flow Quiz'},
                'questions': [
                    {'text': 'What keyword starts a conditional block?', 'choices': ['when', 'if', 'switch', 'case'], 'correct': 1, 'explanation': 'Python uses if/elif/else for conditionals.'},
                    {'text': 'Which loop iterates over a sequence?', 'choices': ['while', 'for', 'do', 'each'], 'correct': 1, 'explanation': 'for loop iterates over any iterable.'},
                    {'text': 'What does "break" do in a loop?', 'choices': ['Skips current iteration', 'Exits the loop', 'Restarts the loop', 'Pauses execution'], 'correct': 1, 'explanation': 'break immediately exits the innermost loop.'},
                    {'text': 'What does "continue" do?', 'choices': ['Exits the loop', 'Skips to next iteration', 'Ends the program', 'Restarts from beginning'], 'correct': 1, 'explanation': 'continue skips the rest of the current iteration.'},
                    {'text': 'What is the output of [x for x in range(3)]?', 'choices': ['[1, 2, 3]', '[0, 1, 2]', '[0, 1, 2, 3]', '[1, 2]'], 'correct': 1, 'explanation': 'range(3) produces 0, 1, 2.'},
                    {'text': 'Which is NOT a comparison operator?', 'choices': ['==', '!=', '<>', '>='], 'correct': 2, 'explanation': '<> is not valid in Python 3. Use != instead.'},
                    {'text': 'What does "elif" mean?', 'choices': ['else finally', 'else if', 'end if', 'element if'], 'correct': 1, 'explanation': 'elif is shorthand for else if.'},
                    {'text': 'How many times does while True run?', 'choices': ['Once', 'Twice', 'Forever (until break)', 'Never'], 'correct': 2, 'explanation': 'while True creates an infinite loop; use break to exit.'},
                    {'text': 'What is range(2, 8, 2)?', 'choices': ['[2, 4, 6]', '[2, 4, 6, 8]', '[2, 3, 4, 5, 6, 7]', '[2, 8]'], 'correct': 0, 'explanation': 'range(2,8,2) yields 2, 4, 6 (start=2, stop=8 exclusive, step=2).'},
                    {'text': 'What does "pass" do?', 'choices': ['Exits function', 'Does nothing (placeholder)', 'Passes a value', 'Skips iteration'], 'correct': 1, 'explanation': 'pass is a no-op placeholder.'},
                ],
            },
            {
                'title': {'en': 'Functions & Modules Quiz'},
                'questions': [
                    {'text': 'Which keyword defines a function?', 'choices': ['function', 'func', 'def', 'fn'], 'correct': 2, 'explanation': 'Python uses "def" to define functions.'},
                    {'text': 'What does return do?', 'choices': ['Prints a value', 'Sends a value back to the caller', 'Loops back', 'Imports a module'], 'correct': 1, 'explanation': 'return sends a value back and exits the function.'},
                    {'text': 'What is a default parameter?', 'choices': ['A required argument', 'A parameter with a preset value', 'The first parameter', 'A global variable'], 'correct': 1, 'explanation': 'Default parameters have values used when no argument is passed.'},
                    {'text': 'How do you import a module?', 'choices': ['require math', 'include math', 'import math', 'using math'], 'correct': 2, 'explanation': 'Python uses "import" to load modules.'},
                    {'text': 'What is *args?', 'choices': ['A list argument', 'Variable positional arguments', 'A keyword argument', 'A decorator'], 'correct': 1, 'explanation': '*args collects extra positional arguments into a tuple.'},
                    {'text': 'What is **kwargs?', 'choices': ['Positional arguments', 'Keyword variable arguments', 'A dictionary', 'An error'], 'correct': 1, 'explanation': '**kwargs collects extra keyword arguments into a dict.'},
                    {'text': 'What is a lambda function?', 'choices': ['A named function', 'An anonymous function', 'A class method', 'A built-in function'], 'correct': 1, 'explanation': 'lambda creates small anonymous functions.'},
                    {'text': 'What does "from math import pi" do?', 'choices': ['Imports all of math', 'Imports only pi from math', 'Creates a variable pi', 'Nothing'], 'correct': 1, 'explanation': 'It imports only the pi constant from the math module.'},
                    {'text': 'What is the scope of a variable inside a function?', 'choices': ['Global', 'Local', 'Universal', 'Static'], 'correct': 1, 'explanation': 'Variables defined inside a function are local to that function.'},
                    {'text': 'Can a function return multiple values?', 'choices': ['No', 'Yes, as a tuple', 'Yes, as a list only', 'Only with special syntax'], 'correct': 1, 'explanation': 'Python functions can return multiple values as a tuple.'},
                ],
            },
            {
                'title': {'en': 'OOP Quiz'},
                'questions': [
                    {'text': 'What keyword creates a class?', 'choices': ['struct', 'object', 'class', 'type'], 'correct': 2, 'explanation': 'Python uses "class" to define classes.'},
                    {'text': 'What is __init__?', 'choices': ['A destructor', 'A constructor/initializer', 'A static method', 'A property'], 'correct': 1, 'explanation': '__init__ is called when creating a new instance.'},
                    {'text': 'What does "self" refer to?', 'choices': ['The class', 'The current instance', 'The parent class', 'A global object'], 'correct': 1, 'explanation': 'self refers to the current instance of the class.'},
                    {'text': 'What is inheritance?', 'choices': ['Copying code', 'A class deriving from another class', 'A function feature', 'Variable scoping'], 'correct': 1, 'explanation': 'Inheritance lets a child class reuse parent class functionality.'},
                    {'text': 'What is polymorphism?', 'choices': ['Multiple inheritance', 'Same interface, different implementations', 'Variable types', 'Function overloading only'], 'correct': 1, 'explanation': 'Polymorphism allows different classes to provide the same interface.'},
                    {'text': 'What is encapsulation?', 'choices': ['Hiding implementation details', 'Writing fast code', 'Using global variables', 'Creating loops'], 'correct': 0, 'explanation': 'Encapsulation bundles data with methods and restricts direct access.'},
                    {'text': 'How do you make a private attribute?', 'choices': ['private x', 'self.__x', 'self.x = private', '#x'], 'correct': 1, 'explanation': 'Double underscore prefix triggers name mangling for privacy.'},
                    {'text': 'What is super() used for?', 'choices': ['Creating superclasses', 'Calling parent class methods', 'Making variables global', 'Type checking'], 'correct': 1, 'explanation': 'super() returns a proxy to delegate method calls to a parent class.'},
                    {'text': 'Can Python have multiple inheritance?', 'choices': ['No', 'Yes', 'Only with mixins', 'Only two levels'], 'correct': 1, 'explanation': 'Python supports multiple inheritance.'},
                    {'text': 'What is a class method?', 'choices': ['A regular function', 'A method bound to the class, not instance', 'A private method', 'A static function'], 'correct': 1, 'explanation': 'Class methods receive the class as the first argument (cls).'},
                ],
            },
        ]

        # Assessment questions (50)
        assessment_questions = [
            {'text': 'What is the output of print(2 + 3)?', 'choices': ['23', '5', '2 + 3', 'Error'], 'correct': 1},
            {'text': 'Which is a mutable data type?', 'choices': ['str', 'tuple', 'list', 'int'], 'correct': 2},
            {'text': 'What does len("hello") return?', 'choices': ['4', '5', '6', 'Error'], 'correct': 1},
            {'text': 'How to convert "123" to an integer?', 'choices': ['integer("123")', 'int("123")', 'toInt("123")', 'Number("123")'], 'correct': 1},
            {'text': 'What is a dictionary in Python?', 'choices': ['An ordered list', 'A key-value mapping', 'A set of tuples', 'A string type'], 'correct': 1},
            {'text': 'What does .append() do to a list?', 'choices': ['Removes last item', 'Adds item at end', 'Sorts the list', 'Reverses the list'], 'correct': 1},
            {'text': 'What is the correct file extension for Python?', 'choices': ['.pt', '.py', '.python', '.pyt'], 'correct': 1},
            {'text': 'How do you start a while loop?', 'choices': ['while (condition):', 'while condition:', 'loop while condition:', 'do while condition:'], 'correct': 1},
            {'text': 'What is None in Python?', 'choices': ['Zero', 'Empty string', 'Null/no value', 'False'], 'correct': 2},
            {'text': 'What operator checks identity?', 'choices': ['==', '===', 'is', 'equals'], 'correct': 2},
            {'text': 'How do you handle exceptions?', 'choices': ['try/catch', 'try/except', 'handle/error', 'begin/rescue'], 'correct': 1},
            {'text': 'What is a set?', 'choices': ['Ordered duplicates allowed', 'Unordered unique elements', 'Key-value pairs', 'A list alias'], 'correct': 1},
            {'text': 'What does strip() do to a string?', 'choices': ['Removes vowels', 'Removes whitespace from both ends', 'Converts to lowercase', 'Splits the string'], 'correct': 1},
            {'text': 'What is list slicing syntax?', 'choices': ['list(start, end)', 'list[start:end]', 'list.slice(start, end)', 'slice(list, start, end)'], 'correct': 1},
            {'text': 'What is PEP 8?', 'choices': ['A Python version', 'Style guide for Python', 'A testing framework', 'A package manager'], 'correct': 1},
            {'text': 'What does enumerate() do?', 'choices': ['Counts items', 'Returns index-value pairs', 'Sorts a list', 'Filters a list'], 'correct': 1},
            {'text': 'What is a generator?', 'choices': ['A class type', 'A function that yields values lazily', 'A list comprehension', 'A random number tool'], 'correct': 1},
            {'text': 'What does zip() do?', 'choices': ['Compresses files', 'Pairs elements from iterables', 'Sorts two lists', 'Merges dictionaries'], 'correct': 1},
            {'text': 'What is a decorator?', 'choices': ['A design pattern', 'A function that wraps another function', 'A class attribute', 'A comment style'], 'correct': 1},
            {'text': 'How to open a file for reading?', 'choices': ['open("f", "r")', 'file.read("f")', 'read("f")', 'File("f")'], 'correct': 0},
            {'text': 'What is pip?', 'choices': ['A Python IDE', 'A package installer', 'A debugger', 'A compiler'], 'correct': 1},
            {'text': 'What does map() do?', 'choices': ['Creates a dictionary', 'Applies function to each item', 'Filters items', 'Sorts items'], 'correct': 1},
            {'text': 'What is a virtual environment?', 'choices': ['A VM', 'Isolated Python environment', 'A cloud service', 'A Docker container'], 'correct': 1},
            {'text': 'What is __name__ == "__main__"?', 'choices': ['Error check', 'Entry point guard', 'Import statement', 'Class definition'], 'correct': 1},
            {'text': 'How to check if key exists in dict?', 'choices': ['dict.has(key)', 'key in dict', 'dict.exists(key)', 'dict.contains(key)'], 'correct': 1},
            {'text': 'What is a module?', 'choices': ['A class', 'A Python file with code', 'A function', 'A variable'], 'correct': 1},
            {'text': 'What does sorted() return?', 'choices': ['None', 'A new sorted list', 'Sorts in-place', 'A tuple'], 'correct': 1},
            {'text': 'What is a docstring?', 'choices': ['A comment', 'A string literal for documentation', 'A variable name', 'A file type'], 'correct': 1},
            {'text': 'How to handle multiple exceptions?', 'choices': ['Multiple try blocks', 'except (Type1, Type2)', 'catch all', 'handle multiple'], 'correct': 1},
            {'text': 'What is the Global Interpreter Lock (GIL)?', 'choices': ['A security feature', 'Mutex for thread safety in CPython', 'A package lock', 'A file lock'], 'correct': 1},
            {'text': 'What does isinstance() check?', 'choices': ['Variable name', 'If object is instance of a class', 'If value is None', 'Type conversion'], 'correct': 1},
            {'text': 'What is a list comprehension?', 'choices': ['A for loop', 'Compact syntax to create lists', 'A sort method', 'A filter function'], 'correct': 1},
            {'text': 'What does json.loads() do?', 'choices': ['Loads a JSON file', 'Parses JSON string to Python object', 'Writes JSON', 'Validates JSON'], 'correct': 1},
            {'text': 'What is the difference between == and is?', 'choices': ['No difference', '== checks value, is checks identity', '== checks type, is checks value', 'is is faster'], 'correct': 1},
            {'text': 'What does the with statement do?', 'choices': ['Creates a loop', 'Context management (auto-cleanup)', 'Defines a class', 'Imports a module'], 'correct': 1},
            {'text': 'What is a frozen set?', 'choices': ['A cold set', 'An immutable set', 'A sorted set', 'A set of tuples'], 'correct': 1},
            {'text': 'How to make a shallow copy of a list?', 'choices': ['list2 = list1', 'list2 = list1.copy()', 'list2 = copy(list1)', 'list2 = list1[:]'], 'correct': 1},
            {'text': 'What is the ternary operator in Python?', 'choices': ['condition ? a : b', 'a if condition else b', 'if condition then a else b', 'condition && a || b'], 'correct': 1},
            {'text': 'What is __str__ used for?', 'choices': ['String conversion', 'Human-readable string representation', 'String formatting', 'String comparison'], 'correct': 1},
            {'text': 'What does @staticmethod do?', 'choices': ['Makes method static (no self/cls)', 'Makes method private', 'Makes method async', 'Makes method abstract'], 'correct': 0},
            {'text': 'What is the purpose of __repr__?', 'choices': ['Display purpose', 'Unambiguous string for debugging', 'File representation', 'Network repr'], 'correct': 1},
            {'text': 'How to sort a dict by values?', 'choices': ['dict.sort()', 'sorted(dict, key=dict.get)', 'dict.values().sort()', 'sort(dict)'], 'correct': 1},
            {'text': 'What is a property in Python?', 'choices': ['A variable', 'A managed attribute with getter/setter', 'A constant', 'A class name'], 'correct': 1},
            {'text': 'What does yield do?', 'choices': ['Returns and exits', 'Produces value and pauses', 'Raises exception', 'Imports module'], 'correct': 1},
            {'text': 'What is duck typing?', 'choices': ['A test framework', 'If it quacks like a duck, treat it as one', 'Type checking', 'A design pattern'], 'correct': 1},
            {'text': 'How to create an empty dictionary?', 'choices': ['dict[]', '{}', 'dict()', 'Both {} and dict()'], 'correct': 3},
            {'text': 'What is the walrus operator?', 'choices': [':=', '==', '<=', '>='], 'correct': 0},
            {'text': 'What does f-string do?', 'choices': ['File string', 'Formatted string literal', 'Function string', 'Float string'], 'correct': 1},
            {'text': 'What is asyncio used for?', 'choices': ['File I/O', 'Asynchronous programming', 'Testing', 'Debugging'], 'correct': 1},
            {'text': 'What is type hinting?', 'choices': ['Runtime type checking', 'Optional annotations for expected types', 'Automatic type conversion', 'Error handling'], 'correct': 1},
        ]

        modules = list(course.modules.all().order_by('order'))

        for i, module in enumerate(modules):
            if i >= len(module_quizzes):
                break
            qdata = module_quizzes[i]
            quiz = Quiz.objects.create(
                course=course, module=module,
                title=qdata['title'],
                quiz_type='module_quiz',
                questions_count=len(qdata['questions']),
                order=i + 1,
            )
            for qi, qd in enumerate(qdata['questions']):
                question = Question.objects.create(
                    quiz=quiz, text=qd['text'], order=qi + 1,
                    explanation=qd.get('explanation', ''),
                )
                for ci, ct in enumerate(qd['choices']):
                    Choice.objects.create(
                        question=question, text=ct,
                        is_correct=(ci == qd['correct']),
                        order=ci + 1,
                    )

        # Assessment
        assessment = Quiz.objects.create(
            course=course, module=None,
            title={'en': 'Python Final Assessment'},
            quiz_type='assessment',
            questions_count=len(assessment_questions),
            order=len(modules) + 1,
        )
        for qi, qd in enumerate(assessment_questions):
            question = Question.objects.create(
                quiz=assessment, text=qd['text'], order=qi + 1,
                explanation=qd.get('explanation', ''),
            )
            for ci, ct in enumerate(qd['choices']):
                Choice.objects.create(
                    question=question, text=ct,
                    is_correct=(ci == qd['correct']),
                    order=ci + 1,
                )

        self.stdout.write(self.style.SUCCESS(
            f'  Quizzes: {Quiz.objects.count()} | Questions: {Question.objects.count()} | Choices: {Choice.objects.count()}'
        ))

    def _enrich_python_lessons(self, course):
        """Add rich content to Python course lessons."""
        lesson_content = {
            'Why Python?': {
                'content': {'en': '<h2>Why Learn Python?</h2><p>Python is one of the most popular programming languages in the world. It\'s used in web development, data science, AI, automation, and more.</p><h3>Key Advantages</h3><ul><li><strong>Easy to learn</strong> — Clean, readable syntax</li><li><strong>Versatile</strong> — Web, data, AI, scripting</li><li><strong>Large community</strong> — Tons of libraries and support</li><li><strong>High demand</strong> — Top-paying programming jobs</li></ul><h3>Who Uses Python?</h3><p>Google, Netflix, Instagram, Spotify, NASA, and thousands of companies use Python daily.</p><pre><code>print("Hello, Python!")\n# This is your first line of Python code!</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/Y8Tko2YC5hA',
                'video_duration': '12m 30s',
            },
            'Installing Python & IDE Setup': {
                'content': {'en': '<h2>Setting Up Your Environment</h2><p>Before writing Python code, you need to install Python and choose an IDE (Integrated Development Environment).</p><h3>Step 1: Install Python</h3><ol><li>Visit <a href="https://python.org">python.org</a></li><li>Download the latest version</li><li>Run the installer (check "Add to PATH"!)</li></ol><h3>Step 2: Choose an IDE</h3><ul><li><strong>VS Code</strong> — Free, lightweight, extensible</li><li><strong>PyCharm</strong> — Full-featured Python IDE</li><li><strong>Jupyter Notebook</strong> — Great for data science</li></ul>'},
                'video_url': 'https://www.youtube.com/embed/YYXdXT2l-Gg',
                'video_duration': '8m 15s',
            },
            'Variables & Data Types': {
                'content': {'en': '<h2>Variables & Data Types</h2><p>Variables store data values. Python has no command for declaring a variable — it\'s created the moment you assign a value.</p><pre><code>name = "Alice"    # str\nage = 25          # int\nheight = 5.6      # float\nis_student = True  # bool</code></pre><h3>Common Data Types</h3><ul><li><code>str</code> — Text ("hello")</li><li><code>int</code> — Whole numbers (42)</li><li><code>float</code> — Decimal numbers (3.14)</li><li><code>bool</code> — True/False</li><li><code>list</code> — Ordered collection [1, 2, 3]</li><li><code>dict</code> — Key-value pairs {"key": "value"}</li></ul>'},
                'video_url': 'https://www.youtube.com/embed/cQT33yu9pY8',
                'video_duration': '15m 42s',
            },
            'Operators & Expressions': {
                'content': {'en': '<h2>Operators & Expressions</h2><p>Operators are used to perform operations on variables and values.</p><h3>Arithmetic Operators</h3><pre><code>a + b   # Addition\na - b   # Subtraction\na * b   # Multiplication\na / b   # Division\na // b  # Floor division\na % b   # Modulo\na ** b  # Exponentiation</code></pre><h3>Comparison Operators</h3><pre><code>==  !=  <  >  <=  >=</code></pre><h3>Logical Operators</h3><pre><code>and  or  not</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/v5MR5JnKcZI',
                'video_duration': '11m 20s',
            },
            'If/Else Statements': {
                'content': {'en': '<h2>Conditional Statements</h2><p>Python uses if/elif/else to make decisions.</p><pre><code>age = 18\n\nif age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teenager")\nelse:\n    print("Child")</code></pre><h3>Key Points</h3><ul><li>Indentation matters! (4 spaces)</li><li>Use elif for multiple conditions</li><li>else is optional</li></ul>'},
                'video_url': 'https://www.youtube.com/embed/Zp5MuPOtsSY',
                'video_duration': '14m 05s',
            },
            'For & While Loops': {
                'content': {'en': '<h2>Loops in Python</h2><h3>For Loop</h3><pre><code>for i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)</code></pre><h3>While Loop</h3><pre><code>count = 0\nwhile count < 5:\n    print(count)\n    count += 1</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/6iF8Xb7Z3wQ',
                'video_duration': '18m 30s',
            },
            'List Comprehensions': {
                'content': {'en': '<h2>List Comprehensions</h2><p>A concise way to create lists.</p><pre><code># Traditional\nsquares = []\nfor x in range(10):\n    squares.append(x ** 2)\n\n# List comprehension\nsquares = [x ** 2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/3dt4OGnU5sM',
                'video_duration': '10m 15s',
            },
            'Defining Functions': {
                'content': {'en': '<h2>Functions</h2><p>Functions are reusable blocks of code.</p><pre><code>def greet(name):\n    """Greet someone by name."""\n    return f"Hello, {name}!"\n\nresult = greet("Alice")\nprint(result)  # Hello, Alice!</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/9Os0o3wzS_I',
                'video_duration': '16m 45s',
            },
            'Parameters & Return Values': {
                'content': {'en': '<h2>Parameters & Return Values</h2><pre><code># Default parameters\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\n# Multiple return values\ndef min_max(numbers):\n    return min(numbers), max(numbers)\n\nlow, high = min_max([3, 1, 4, 1, 5])</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/9Os0o3wzS_I',
                'video_duration': '13m 20s',
            },
            'Importing Modules': {
                'content': {'en': '<h2>Modules & Imports</h2><pre><code>import math\nprint(math.pi)  # 3.14159...\n\nfrom random import randint\nprint(randint(1, 10))\n\nimport os\nprint(os.getcwd())</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/CqvZ3vGoGs0',
                'video_duration': '11m 50s',
            },
            'Classes & Objects': {
                'content': {'en': '<h2>Classes & Objects</h2><pre><code>class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        return f"{self.name} says Woof!"\n\nmy_dog = Dog("Rex", "German Shepherd")\nprint(my_dog.bark())  # Rex says Woof!</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/ZDa-Z5JzLYM',
                'video_duration': '20m 10s',
            },
            'Inheritance & Polymorphism': {
                'content': {'en': '<h2>Inheritance & Polymorphism</h2><pre><code>class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        raise NotImplementedError\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} says Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return f"{self.name} says Meow!"\n\n# Polymorphism\nfor animal in [Dog("Rex"), Cat("Whiskers")]:\n    print(animal.speak())</code></pre>'},
                'video_url': 'https://www.youtube.com/embed/Cn7AkDb4pIU',
                'video_duration': '22m 35s',
            },
        }

        for module in course.modules.all():
            for lesson in module.lessons.all():
                en_title = lesson.title.get('en', '') if isinstance(lesson.title, dict) else str(lesson.title)
                if en_title in lesson_content:
                    data = lesson_content[en_title]
                    lesson.content = data.get('content', lesson.content)
                    lesson.video_url = data.get('video_url', '')
                    lesson.video_duration = data.get('video_duration', '')
                    lesson.save()
