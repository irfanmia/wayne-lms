"""Seed practice mode data for the Introduction to Python course."""
from django.core.management.base import BaseCommand
from apps.courses.models import (
    Course, CourseConcept, CourseExercise, CourseBadge,
    CourseExerciseProgress, UserCourseBadge,
)


CONCEPTS = [
    {'title': 'Variables', 'slug': 'variables', 'order': 1, 'icon': '📦', 'description': 'Learn about Python variables, data types, and type conversion.'},
    {'title': 'Control Flow', 'slug': 'control-flow', 'order': 2, 'icon': '🔀', 'description': 'Master if/else statements, loops, and conditional logic.'},
    {'title': 'Functions', 'slug': 'functions', 'order': 3, 'icon': '⚙️', 'description': 'Define and use functions, parameters, and return values.'},
    {'title': 'Data Structures', 'slug': 'data-structures', 'order': 4, 'icon': '🗂️', 'description': 'Work with lists, dictionaries, sets, and other data structures.'},
    {'title': 'OOP', 'slug': 'oop', 'order': 5, 'icon': '🏗️', 'description': 'Object-oriented programming with classes and inheritance.'},
    {'title': 'File I/O', 'slug': 'file-io', 'order': 6, 'icon': '📁', 'description': 'Read from and write to files in Python.'},
]

# Prerequisites: concept_slug -> [prerequisite_slugs]
PREREQS = {
    'control-flow': ['variables'],
    'functions': ['control-flow'],
    'data-structures': ['functions'],
    'oop': ['data-structures'],
    'file-io': ['variables'],
}

EXERCISES = {
    'variables': [
        {
            'title': 'Hello World', 'slug': 'hello-world', 'difficulty': 'easy', 'points': 10, 'order': 1,
            'description': 'Write your first Python program.',
            'instructions': 'Create a function called `hello()` that returns the string "Hello, World!".',
            'starter_code': 'def hello():\n    # Your code here\n    pass',
            'test_code': '''result = hello()
if result == "Hello, World!":
    print("PASS: hello() returns correct string")
else:
    print(f"FAIL: Expected 'Hello, World!' but got '{result}'")''',
            'solution': 'def hello():\n    return "Hello, World!"',
        },
        {
            'title': 'Variable Swap', 'slug': 'variable-swap', 'difficulty': 'easy', 'points': 10, 'order': 2,
            'description': 'Swap two variables without a temp variable.',
            'instructions': 'Create a function `swap(a, b)` that returns a tuple with the values swapped.',
            'starter_code': 'def swap(a, b):\n    # Your code here\n    pass',
            'test_code': '''r1 = swap(1, 2)
r2 = swap("hello", "world")
if r1 == (2, 1):
    print("PASS: swap(1, 2) returns (2, 1)")
else:
    print(f"FAIL: swap(1, 2) returned {r1}")
if r2 == ("world", "hello"):
    print("PASS: swap strings works")
else:
    print(f"FAIL: swap strings returned {r2}")''',
            'solution': 'def swap(a, b):\n    return (b, a)',
        },
        {
            'title': 'Type Converter', 'slug': 'type-converter', 'difficulty': 'easy', 'points': 10, 'order': 3,
            'description': 'Convert between different data types.',
            'instructions': 'Create a function `convert(value)` that: if given a string of digits, returns the integer; if given an int, returns the string; otherwise returns str(value).',
            'starter_code': 'def convert(value):\n    # Your code here\n    pass',
            'test_code': '''if convert("42") == 42:
    print("PASS: string to int")
else:
    print(f"FAIL: convert('42') returned {convert('42')}")
if convert(42) == "42":
    print("PASS: int to string")
else:
    print(f"FAIL: convert(42) returned {convert(42)}")
if convert(3.14) == "3.14":
    print("PASS: float to string")
else:
    print(f"FAIL: convert(3.14) returned {convert(3.14)}")''',
            'solution': 'def convert(value):\n    if isinstance(value, str) and value.isdigit():\n        return int(value)\n    elif isinstance(value, int):\n        return str(value)\n    return str(value)',
        },
    ],
    'control-flow': [
        {
            'title': 'FizzBuzz', 'slug': 'fizzbuzz', 'difficulty': 'easy', 'points': 10, 'order': 1,
            'description': 'The classic FizzBuzz problem.',
            'instructions': 'Create `fizzbuzz(n)` that returns "Fizz" if n is divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, otherwise the number as a string.',
            'starter_code': 'def fizzbuzz(n):\n    # Your code here\n    pass',
            'test_code': '''tests = [(15, "FizzBuzz"), (3, "Fizz"), (5, "Buzz"), (7, "7"), (30, "FizzBuzz")]
for n, expected in tests:
    result = fizzbuzz(n)
    if result == expected:
        print(f"PASS: fizzbuzz({n}) = {expected}")
    else:
        print(f"FAIL: fizzbuzz({n}) expected {expected}, got {result}")''',
            'solution': 'def fizzbuzz(n):\n    if n % 15 == 0: return "FizzBuzz"\n    if n % 3 == 0: return "Fizz"\n    if n % 5 == 0: return "Buzz"\n    return str(n)',
        },
        {
            'title': 'Grade Calculator', 'slug': 'grade-calculator', 'difficulty': 'medium', 'points': 20, 'order': 2,
            'description': 'Calculate letter grades from scores.',
            'instructions': 'Create `grade(score)` that returns: "A" for 90-100, "B" for 80-89, "C" for 70-79, "D" for 60-69, "F" below 60.',
            'starter_code': 'def grade(score):\n    # Your code here\n    pass',
            'test_code': '''tests = [(95, "A"), (85, "B"), (75, "C"), (65, "D"), (55, "F"), (100, "A"), (0, "F")]
for score, expected in tests:
    result = grade(score)
    if result == expected:
        print(f"PASS: grade({score}) = {expected}")
    else:
        print(f"FAIL: grade({score}) expected {expected}, got {result}")''',
            'solution': 'def grade(score):\n    if score >= 90: return "A"\n    if score >= 80: return "B"\n    if score >= 70: return "C"\n    if score >= 60: return "D"\n    return "F"',
        },
        {
            'title': 'Leap Year', 'slug': 'leap-year', 'difficulty': 'easy', 'points': 10, 'order': 3,
            'description': 'Determine if a year is a leap year.',
            'instructions': 'Create `is_leap_year(year)` that returns True if the year is a leap year. A year is a leap year if divisible by 4, except centuries unless divisible by 400.',
            'starter_code': 'def is_leap_year(year):\n    # Your code here\n    pass',
            'test_code': '''tests = [(2000, True), (1900, False), (2024, True), (2023, False), (1600, True)]
for year, expected in tests:
    result = is_leap_year(year)
    if result == expected:
        print(f"PASS: is_leap_year({year}) = {expected}")
    else:
        print(f"FAIL: is_leap_year({year}) expected {expected}, got {result}")''',
            'solution': 'def is_leap_year(year):\n    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)',
        },
        {
            'title': 'Number Guesser', 'slug': 'number-guesser', 'difficulty': 'medium', 'points': 20, 'order': 4,
            'description': 'Give hints for a number guessing game.',
            'instructions': 'Create `check_guess(secret, guess)` that returns "correct" if guess matches, "too high" if guess > secret, "too low" if guess < secret.',
            'starter_code': 'def check_guess(secret, guess):\n    # Your code here\n    pass',
            'test_code': '''tests = [(42, 42, "correct"), (42, 50, "too high"), (42, 30, "too low")]
for secret, guess, expected in tests:
    result = check_guess(secret, guess)
    if result == expected:
        print(f"PASS: check_guess({secret}, {guess}) = {expected}")
    else:
        print(f"FAIL: check_guess({secret}, {guess}) expected {expected}, got {result}")''',
            'solution': 'def check_guess(secret, guess):\n    if guess == secret: return "correct"\n    if guess > secret: return "too high"\n    return "too low"',
        },
    ],
    'functions': [
        {
            'title': 'Calculator', 'slug': 'calculator', 'difficulty': 'medium', 'points': 20, 'order': 1,
            'description': 'Build a simple calculator function.',
            'instructions': 'Create `calculate(a, b, op)` where op is "+", "-", "*", or "/". Return the result. For division by zero, return "Error".',
            'starter_code': 'def calculate(a, b, op):\n    # Your code here\n    pass',
            'test_code': '''tests = [(10, 5, "+", 15), (10, 3, "-", 7), (4, 5, "*", 20), (10, 2, "/", 5.0)]
for a, b, op, expected in tests:
    result = calculate(a, b, op)
    if result == expected:
        print(f"PASS: calculate({a}, {b}, '{op}') = {expected}")
    else:
        print(f"FAIL: calculate({a}, {b}, '{op}') expected {expected}, got {result}")
if calculate(5, 0, "/") == "Error":
    print("PASS: division by zero returns Error")
else:
    print("FAIL: division by zero should return Error")''',
            'solution': 'def calculate(a, b, op):\n    if op == "+": return a + b\n    if op == "-": return a - b\n    if op == "*": return a * b\n    if op == "/":\n        if b == 0: return "Error"\n        return a / b',
        },
        {
            'title': 'Palindrome Checker', 'slug': 'palindrome-checker', 'difficulty': 'easy', 'points': 10, 'order': 2,
            'description': 'Check if a string is a palindrome.',
            'instructions': 'Create `is_palindrome(s)` that returns True if the string reads the same forwards and backwards (case-insensitive, ignoring spaces).',
            'starter_code': 'def is_palindrome(s):\n    # Your code here\n    pass',
            'test_code': '''tests = [("racecar", True), ("hello", False), ("A man a plan a canal Panama", True), ("", True)]
for s, expected in tests:
    result = is_palindrome(s)
    if result == expected:
        print(f"PASS: is_palindrome('{s}') = {expected}")
    else:
        print(f"FAIL: is_palindrome('{s}') expected {expected}, got {result}")''',
            'solution': 'def is_palindrome(s):\n    clean = s.lower().replace(" ", "")\n    return clean == clean[::-1]',
        },
        {
            'title': 'Fibonacci', 'slug': 'fibonacci', 'difficulty': 'medium', 'points': 20, 'order': 3,
            'description': 'Generate Fibonacci numbers.',
            'instructions': 'Create `fibonacci(n)` that returns a list of the first n Fibonacci numbers starting with [0, 1, 1, 2, ...].',
            'starter_code': 'def fibonacci(n):\n    # Your code here\n    pass',
            'test_code': '''if fibonacci(1) == [0]:
    print("PASS: fibonacci(1)")
else:
    print(f"FAIL: fibonacci(1) = {fibonacci(1)}")
if fibonacci(5) == [0, 1, 1, 2, 3]:
    print("PASS: fibonacci(5)")
else:
    print(f"FAIL: fibonacci(5) = {fibonacci(5)}")
if fibonacci(8) == [0, 1, 1, 2, 3, 5, 8, 13]:
    print("PASS: fibonacci(8)")
else:
    print(f"FAIL: fibonacci(8) = {fibonacci(8)}")''',
            'solution': 'def fibonacci(n):\n    if n <= 0: return []\n    if n == 1: return [0]\n    fibs = [0, 1]\n    for _ in range(2, n):\n        fibs.append(fibs[-1] + fibs[-2])\n    return fibs',
        },
    ],
    'data-structures': [
        {
            'title': 'List Operations', 'slug': 'list-operations', 'difficulty': 'easy', 'points': 10, 'order': 1,
            'description': 'Practice common list operations.',
            'instructions': 'Create `list_stats(nums)` that returns a dict with keys "sum", "min", "max", "avg" (float) for a list of numbers. Return all zeros for empty list.',
            'starter_code': 'def list_stats(nums):\n    # Your code here\n    pass',
            'test_code': '''r = list_stats([1, 2, 3, 4, 5])
if r == {"sum": 15, "min": 1, "max": 5, "avg": 3.0}:
    print("PASS: basic list stats")
else:
    print(f"FAIL: got {r}")
r2 = list_stats([])
if r2 == {"sum": 0, "min": 0, "max": 0, "avg": 0}:
    print("PASS: empty list")
else:
    print(f"FAIL: empty list got {r2}")''',
            'solution': 'def list_stats(nums):\n    if not nums:\n        return {"sum": 0, "min": 0, "max": 0, "avg": 0}\n    return {"sum": sum(nums), "min": min(nums), "max": max(nums), "avg": sum(nums) / len(nums)}',
        },
        {
            'title': 'Dict Counter', 'slug': 'dict-counter', 'difficulty': 'medium', 'points': 20, 'order': 2,
            'description': 'Count character frequencies.',
            'instructions': 'Create `char_count(s)` that returns a dict mapping each character to its count. Ignore spaces.',
            'starter_code': 'def char_count(s):\n    # Your code here\n    pass',
            'test_code': '''r = char_count("hello")
if r == {"h": 1, "e": 1, "l": 2, "o": 1}:
    print("PASS: char_count hello")
else:
    print(f"FAIL: got {r}")
r2 = char_count("a b a")
if r2 == {"a": 2, "b": 1}:
    print("PASS: ignores spaces")
else:
    print(f"FAIL: got {r2}")''',
            'solution': 'def char_count(s):\n    counts = {}\n    for c in s:\n        if c != " ":\n            counts[c] = counts.get(c, 0) + 1\n    return counts',
        },
        {
            'title': 'Set Operations', 'slug': 'set-operations', 'difficulty': 'easy', 'points': 10, 'order': 3,
            'description': 'Practice set operations.',
            'instructions': 'Create `set_ops(a, b)` that takes two lists and returns a dict with "union", "intersection", "difference" (a - b) as sorted lists.',
            'starter_code': 'def set_ops(a, b):\n    # Your code here\n    pass',
            'test_code': '''r = set_ops([1, 2, 3], [2, 3, 4])
if r == {"union": [1, 2, 3, 4], "intersection": [2, 3], "difference": [1]}:
    print("PASS: set operations")
else:
    print(f"FAIL: got {r}")''',
            'solution': 'def set_ops(a, b):\n    sa, sb = set(a), set(b)\n    return {\n        "union": sorted(sa | sb),\n        "intersection": sorted(sa & sb),\n        "difference": sorted(sa - sb)\n    }',
        },
        {
            'title': 'Stack Implementation', 'slug': 'stack-implementation', 'difficulty': 'hard', 'points': 30, 'order': 4,
            'description': 'Implement a stack data structure.',
            'instructions': 'Create a `Stack` class with methods: `push(item)`, `pop()` (returns item or None if empty), `peek()` (returns top or None), `is_empty()` (bool), `size()` (int).',
            'starter_code': 'class Stack:\n    def __init__(self):\n        pass\n\n    def push(self, item):\n        pass\n\n    def pop(self):\n        pass\n\n    def peek(self):\n        pass\n\n    def is_empty(self):\n        pass\n\n    def size(self):\n        pass',
            'test_code': '''s = Stack()
if s.is_empty() == True:
    print("PASS: new stack is empty")
else:
    print("FAIL: new stack should be empty")
s.push(1)
s.push(2)
s.push(3)
if s.size() == 3:
    print("PASS: size is 3")
else:
    print(f"FAIL: size is {s.size()}")
if s.peek() == 3:
    print("PASS: peek returns 3")
else:
    print(f"FAIL: peek returned {s.peek()}")
if s.pop() == 3 and s.pop() == 2:
    print("PASS: pop returns correct order")
else:
    print("FAIL: pop order wrong")
if s.size() == 1:
    print("PASS: size after pops")
else:
    print(f"FAIL: size is {s.size()}")''',
            'solution': 'class Stack:\n    def __init__(self):\n        self._items = []\n\n    def push(self, item):\n        self._items.append(item)\n\n    def pop(self):\n        return self._items.pop() if self._items else None\n\n    def peek(self):\n        return self._items[-1] if self._items else None\n\n    def is_empty(self):\n        return len(self._items) == 0\n\n    def size(self):\n        return len(self._items)',
        },
    ],
    'oop': [
        {
            'title': 'Bank Account', 'slug': 'bank-account', 'difficulty': 'medium', 'points': 20, 'order': 1,
            'description': 'Create a bank account class.',
            'instructions': 'Create a `BankAccount` class with: `__init__(self, owner, balance=0)`, `deposit(amount)` returns new balance, `withdraw(amount)` returns new balance or "Insufficient funds" if amount > balance, `get_balance()` returns current balance.',
            'starter_code': 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        pass\n\n    def deposit(self, amount):\n        pass\n\n    def withdraw(self, amount):\n        pass\n\n    def get_balance(self):\n        pass',
            'test_code': '''acc = BankAccount("Alice", 100)
if acc.get_balance() == 100:
    print("PASS: initial balance")
else:
    print(f"FAIL: balance is {acc.get_balance()}")
if acc.deposit(50) == 150:
    print("PASS: deposit")
else:
    print("FAIL: deposit")
if acc.withdraw(30) == 120:
    print("PASS: withdraw")
else:
    print("FAIL: withdraw")
if acc.withdraw(200) == "Insufficient funds":
    print("PASS: insufficient funds")
else:
    print("FAIL: should be insufficient funds")''',
            'solution': 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            return "Insufficient funds"\n        self.balance -= amount\n        return self.balance\n\n    def get_balance(self):\n        return self.balance',
        },
        {
            'title': 'Shape Calculator', 'slug': 'shape-calculator', 'difficulty': 'hard', 'points': 30, 'order': 2,
            'description': 'Create shape classes with inheritance.',
            'instructions': 'Create a base `Shape` class with `area()` and `perimeter()` methods. Then `Circle(radius)` and `Rectangle(width, height)` that inherit from Shape. Use math.pi for circle calculations.',
            'starter_code': 'import math\n\nclass Shape:\n    def area(self):\n        pass\n\n    def perimeter(self):\n        pass\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        pass\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        pass',
            'test_code': '''import math
c = Circle(5)
if abs(c.area() - math.pi * 25) < 0.01:
    print("PASS: circle area")
else:
    print(f"FAIL: circle area = {c.area()}")
if abs(c.perimeter() - 2 * math.pi * 5) < 0.01:
    print("PASS: circle perimeter")
else:
    print(f"FAIL: circle perimeter = {c.perimeter()}")
r = Rectangle(4, 6)
if r.area() == 24:
    print("PASS: rectangle area")
else:
    print(f"FAIL: rectangle area = {r.area()}")
if r.perimeter() == 20:
    print("PASS: rectangle perimeter")
else:
    print(f"FAIL: rectangle perimeter = {r.perimeter()}")''',
            'solution': 'import math\n\nclass Shape:\n    def area(self):\n        raise NotImplementedError\n\n    def perimeter(self):\n        raise NotImplementedError\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return math.pi * self.radius ** 2\n\n    def perimeter(self):\n        return 2 * math.pi * self.radius\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\n    def perimeter(self):\n        return 2 * (self.width + self.height)',
        },
        {
            'title': 'Student Registry', 'slug': 'student-registry', 'difficulty': 'hard', 'points': 30, 'order': 3,
            'description': 'Build a student registry system.',
            'instructions': 'Create a `StudentRegistry` class with: `add_student(name, grade)`, `get_average()` returns float average of all grades, `get_top_student()` returns name of highest grade, `get_students_above(threshold)` returns list of names with grade >= threshold.',
            'starter_code': 'class StudentRegistry:\n    def __init__(self):\n        pass\n\n    def add_student(self, name, grade):\n        pass\n\n    def get_average(self):\n        pass\n\n    def get_top_student(self):\n        pass\n\n    def get_students_above(self, threshold):\n        pass',
            'test_code': '''reg = StudentRegistry()
reg.add_student("Alice", 90)
reg.add_student("Bob", 75)
reg.add_student("Charlie", 85)
if reg.get_average() == 250/3:
    print("PASS: average")
elif abs(reg.get_average() - 83.33) < 0.1:
    print("PASS: average")
else:
    print(f"FAIL: average = {reg.get_average()}")
if reg.get_top_student() == "Alice":
    print("PASS: top student")
else:
    print(f"FAIL: top student = {reg.get_top_student()}")
above = reg.get_students_above(80)
if sorted(above) == ["Alice", "Charlie"]:
    print("PASS: students above 80")
else:
    print(f"FAIL: students above 80 = {above}")''',
            'solution': 'class StudentRegistry:\n    def __init__(self):\n        self.students = {}\n\n    def add_student(self, name, grade):\n        self.students[name] = grade\n\n    def get_average(self):\n        if not self.students:\n            return 0\n        return sum(self.students.values()) / len(self.students)\n\n    def get_top_student(self):\n        if not self.students:\n            return None\n        return max(self.students, key=self.students.get)\n\n    def get_students_above(self, threshold):\n        return [n for n, g in self.students.items() if g >= threshold]',
        },
    ],
    'file-io': [
        {
            'title': 'Word Counter', 'slug': 'word-counter', 'difficulty': 'medium', 'points': 20, 'order': 1,
            'description': 'Count words in text.',
            'instructions': 'Create `count_words(text)` that returns a dict of word frequencies. Convert all words to lowercase. Ignore punctuation (.,!? only).',
            'starter_code': 'def count_words(text):\n    # Your code here\n    pass',
            'test_code': '''r = count_words("Hello hello world! World.")
expected = {"hello": 2, "world": 2}
if r == expected:
    print("PASS: word count")
else:
    print(f"FAIL: got {r}")
r2 = count_words("")
if r2 == {}:
    print("PASS: empty text")
else:
    print(f"FAIL: empty text got {r2}")''',
            'solution': 'def count_words(text):\n    for ch in ".,!?":\n        text = text.replace(ch, "")\n    words = text.lower().split()\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts',
        },
        {
            'title': 'CSV Reader', 'slug': 'csv-reader', 'difficulty': 'medium', 'points': 20, 'order': 2,
            'description': 'Parse CSV data.',
            'instructions': 'Create `parse_csv(csv_string)` that takes a CSV string (with header row) and returns a list of dicts. Each dict maps column headers to values.',
            'starter_code': 'def parse_csv(csv_string):\n    # Your code here\n    pass',
            'test_code': '''csv = "name,age,city\\nAlice,30,NYC\\nBob,25,LA"
r = parse_csv(csv)
if r == [{"name": "Alice", "age": "30", "city": "NYC"}, {"name": "Bob", "age": "25", "city": "LA"}]:
    print("PASS: csv parsing")
else:
    print(f"FAIL: got {r}")
if parse_csv("a,b") == []:
    print("PASS: header only")
else:
    print(f"FAIL: header only got {parse_csv('a,b')}")''',
            'solution': 'def parse_csv(csv_string):\n    lines = csv_string.strip().split("\\n")\n    if len(lines) < 2:\n        return []\n    headers = lines[0].split(",")\n    result = []\n    for line in lines[1:]:\n        values = line.split(",")\n        result.append(dict(zip(headers, values)))\n    return result',
        },
        {
            'title': 'Log Parser', 'slug': 'log-parser', 'difficulty': 'hard', 'points': 30, 'order': 3,
            'description': 'Parse and analyze log entries.',
            'instructions': 'Create `parse_logs(log_string)` where each line is "LEVEL: message" (e.g., "ERROR: disk full"). Return a dict with counts per level: {"ERROR": 2, "WARN": 1, ...}.',
            'starter_code': 'def parse_logs(log_string):\n    # Your code here\n    pass',
            'test_code': '''logs = "ERROR: disk full\\nWARN: low memory\\nERROR: timeout\\nINFO: started\\nINFO: running"
r = parse_logs(logs)
if r == {"ERROR": 2, "WARN": 1, "INFO": 2}:
    print("PASS: log parsing")
else:
    print(f"FAIL: got {r}")
if parse_logs("") == {}:
    print("PASS: empty logs")
else:
    print(f"FAIL: empty logs got {parse_logs('')}")''',
            'solution': 'def parse_logs(log_string):\n    if not log_string.strip():\n        return {}\n    counts = {}\n    for line in log_string.strip().split("\\n"):\n        level = line.split(":")[0].strip()\n        counts[level] = counts.get(level, 0) + 1\n    return counts',
        },
    ],
}

BADGES = [
    {'name': 'First Code', 'slug': 'first-code', 'description': 'Complete your first exercise', 'icon_url': '🎯', 'criteria_type': 'first_exercise'},
    {'name': 'Easy Peasy', 'slug': 'easy-peasy', 'description': 'Complete all easy exercises', 'icon_url': '🌟', 'criteria_type': 'all_easy'},
    {'name': 'Challenge Accepted', 'slug': 'challenge-accepted', 'description': 'Complete all medium exercises', 'icon_url': '🔥', 'criteria_type': 'all_medium'},
    {'name': 'Hardcore', 'slug': 'hardcore', 'description': 'Complete all hard exercises', 'icon_url': '💎', 'criteria_type': 'all_hard'},
    {'name': 'Python Ninja', 'slug': 'python-ninja', 'description': 'Complete all exercises', 'icon_url': '🥷', 'criteria_type': 'all_exercises'},
    {'name': 'Streak Master', 'slug': 'streak-master', 'description': 'Complete 5 exercises in a row', 'icon_url': '⚡', 'criteria_type': 'streak_5'},
    {'name': 'Concept Clear', 'slug': 'concept-clear', 'description': 'Complete all exercises in a concept', 'icon_url': '🧠', 'criteria_type': 'concept_complete'},
    {'name': 'Perfect Run', 'slug': 'perfect-run', 'description': 'Complete all exercises on first attempt', 'icon_url': '💯', 'criteria_type': 'perfect_score'},
]


class Command(BaseCommand):
    help = 'Seed practice mode data for Introduction to Python course'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **options):
        try:
            course = Course.objects.get(slug='introduction-to-python')
        except Course.DoesNotExist:
            self.stderr.write('Course "introduction-to-python" not found. Run main seed first.')
            return

        if options['clear']:
            self.stdout.write('Clearing existing practice data...')
            UserCourseBadge.objects.filter(course_badge__course=course).delete()
            CourseBadge.objects.filter(course=course).delete()
            CourseExerciseProgress.objects.filter(course_exercise__course=course).delete()
            CourseExercise.objects.filter(course=course).delete()
            CourseConcept.objects.filter(course=course).delete()

        # Create concepts
        concept_map = {}
        for c_data in CONCEPTS:
            concept, _ = CourseConcept.objects.get_or_create(
                course=course, slug=c_data['slug'],
                defaults={k: v for k, v in c_data.items() if k != 'slug'}
            )
            concept_map[c_data['slug']] = concept
            self.stdout.write(f'  Concept: {concept.title}')

        # Set prerequisites
        for slug, prereq_slugs in PREREQS.items():
            concept = concept_map[slug]
            for ps in prereq_slugs:
                concept.prerequisites.add(concept_map[ps])

        # Create exercises
        for concept_slug, exercises in EXERCISES.items():
            concept = concept_map[concept_slug]
            for ex_data in exercises:
                CourseExercise.objects.get_or_create(
                    course=course, slug=ex_data['slug'],
                    defaults={
                        'concept': concept,
                        'title': ex_data['title'],
                        'description': ex_data['description'],
                        'instructions': ex_data['instructions'],
                        'difficulty': ex_data['difficulty'],
                        'starter_code': ex_data['starter_code'],
                        'test_code': ex_data['test_code'],
                        'solution': ex_data['solution'],
                        'language': 'python',
                        'points': ex_data['points'],
                        'order': ex_data['order'],
                    }
                )
                self.stdout.write(f'    Exercise: {ex_data["title"]}')

        # Create badges
        for b_data in BADGES:
            CourseBadge.objects.get_or_create(
                course=course, slug=b_data['slug'],
                defaults={k: v for k, v in b_data.items() if k != 'slug'}
            )
            self.stdout.write(f'  Badge: {b_data["name"]}')

        total_exercises = CourseExercise.objects.filter(course=course).count()
        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(CONCEPTS)} concepts, {total_exercises} exercises, {len(BADGES)} badges'
        ))
