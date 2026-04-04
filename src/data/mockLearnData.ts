// Mock data for the learning view - works without backend

export interface MockChoice {
  id: number;
  text: string;
  order: number;
}

export interface MockQuestion {
  id: number;
  text: string;
  question_type: 'multiple_choice' | 'true_false' | 'multi_select' | 'fill_blank' | 'matching' | 'short_answer';
  order: number;
  choices?: MockChoice[];
  correct_answer?: string;
  correct_choices?: number[];
  matching_pairs?: { left: string; right: string }[];
  explanation?: string;
  points?: number;
}

export interface MockQuiz {
  id: number;
  title: Record<string, string>;
  quiz_type: 'module_quiz' | 'assessment';
  questions_count: number;
  time_limit: number; // minutes
  order: number;
  questions: MockQuestion[];
}

export interface MockLesson {
  id: number;
  title: Record<string, string>;
  lesson_type: 'text' | 'video' | 'quiz' | 'exercise' | 'assignment';
  content: Record<string, string>;
  video_url: string;
  video_duration: string;
  quiz_id: number | null;
  assignment_id: number | null;
  duration: number;
  order: number;
}

export interface MockModule {
  id: number;
  title: Record<string, string>;
  order: number;
  lessons: MockLesson[];
  quiz: { id: number; title: Record<string, string>; questions_count: number } | null;
}

export interface MockCourseLearn {
  id: number;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  thumbnail: string;
  level: string;
  instructor: string;
  modules: MockModule[];
  assessment: { id: number; title: Record<string, string>; questions_count: number } | null;
  progress: { completed_lessons: number[]; total_lessons: number; percent: number };
}

// ═══════════════════════════════════════════════
// QUIZ DATA — Module 1: Python Basics
// ═══════════════════════════════════════════════
const quiz1Questions: MockQuestion[] = [
  {
    id: 1, text: 'What is Python?', question_type: 'multiple_choice', order: 1, points: 1,
    explanation: 'Python is a high-level, interpreted programming language created by Guido van Rossum in 1991.',
    choices: [
      { id: 1, text: 'A type of snake', order: 1 },
      { id: 2, text: 'A high-level programming language', order: 2 },
      { id: 3, text: 'A database management system', order: 3 },
      { id: 4, text: 'An operating system', order: 4 },
    ],
    correct_choices: [2],
  },
  {
    id: 2, text: 'Python is a compiled language.', question_type: 'true_false', order: 2, points: 1,
    explanation: 'Python is an interpreted language — code is executed line by line by the Python interpreter.',
    choices: [
      { id: 5, text: 'True', order: 1 },
      { id: 6, text: 'False', order: 2 },
    ],
    correct_choices: [6],
  },
  {
    id: 3, text: 'Which of the following are valid Python data types? (Select all)', question_type: 'multi_select', order: 3, points: 2,
    explanation: 'int, str, list, and dict are all built-in Python data types. "array" is not a built-in type (it requires the array module).',
    choices: [
      { id: 7, text: 'int', order: 1 },
      { id: 8, text: 'str', order: 2 },
      { id: 9, text: 'array', order: 3 },
      { id: 10, text: 'list', order: 4 },
      { id: 11, text: 'dict', order: 5 },
    ],
    correct_choices: [7, 8, 10, 11],
  },
  {
    id: 4, text: 'The result of type(3.14) in Python is ________.', question_type: 'fill_blank', order: 4, points: 1,
    explanation: '3.14 is a floating-point number, so type() returns <class \'float\'>.',
    correct_answer: 'float',
  },
  {
    id: 5, text: 'Match each Python operator with its description:', question_type: 'matching', order: 5, points: 2,
    explanation: '// is floor division, ** is exponentiation, % is modulo, and == checks equality.',
    matching_pairs: [
      { left: '//', right: 'Floor division' },
      { left: '**', right: 'Exponentiation' },
      { left: '%', right: 'Modulo (remainder)' },
      { left: '==', right: 'Equality comparison' },
    ],
  },
  {
    id: 6, text: 'Explain the difference between a variable and a constant in Python.', question_type: 'short_answer', order: 6, points: 2,
    explanation: 'Python doesn\'t have true constants. By convention, UPPER_CASE names indicate values that shouldn\'t change, but they can still be reassigned.',
  },
  {
    id: 7, text: 'What is the output of: print(10 // 3)?', question_type: 'multiple_choice', order: 7, points: 1,
    explanation: '// performs floor division. 10 / 3 = 3.33..., floored to 3.',
    choices: [
      { id: 12, text: '3.33', order: 1 },
      { id: 13, text: '3', order: 2 },
      { id: 14, text: '4', order: 3 },
      { id: 15, text: '3.0', order: 4 },
    ],
    correct_choices: [13],
  },
  {
    id: 8, text: 'In Python, variable names are case-sensitive.', question_type: 'true_false', order: 8, points: 1,
    explanation: 'Yes! "Name" and "name" are two different variables in Python.',
    choices: [
      { id: 16, text: 'True', order: 1 },
      { id: 17, text: 'False', order: 2 },
    ],
    correct_choices: [16],
  },
  {
    id: 9, text: 'Which of the following are immutable data types in Python? (Select all)', question_type: 'multi_select', order: 9, points: 2,
    explanation: 'Tuples, strings, and integers are immutable. Lists and dictionaries are mutable.',
    choices: [
      { id: 18, text: 'tuple', order: 1 },
      { id: 19, text: 'list', order: 2 },
      { id: 20, text: 'str', order: 3 },
      { id: 21, text: 'dict', order: 4 },
      { id: 22, text: 'int', order: 5 },
    ],
    correct_choices: [18, 20, 22],
  },
  {
    id: 10, text: 'The function used to get user input from the keyboard is ________.', question_type: 'fill_blank', order: 10, points: 1,
    explanation: 'The input() function reads a line from standard input and returns it as a string.',
    correct_answer: 'input',
  },
];

// ═══════════════════════════════════════════════
// QUIZ DATA — Module 2: Control Flow
// ═══════════════════════════════════════════════
const quiz2Questions: MockQuestion[] = [
  {
    id: 11, text: 'What keyword is used for an else-if condition in Python?', question_type: 'multiple_choice', order: 1, points: 1,
    explanation: 'Python uses "elif" as a shorthand for "else if".',
    choices: [
      { id: 23, text: 'else if', order: 1 },
      { id: 24, text: 'elseif', order: 2 },
      { id: 25, text: 'elif', order: 3 },
      { id: 26, text: 'elsif', order: 4 },
    ],
    correct_choices: [25],
  },
  {
    id: 12, text: 'A while loop always executes at least once.', question_type: 'true_false', order: 2, points: 1,
    explanation: 'A while loop checks its condition before executing. If the condition is False initially, the body never runs.',
    choices: [
      { id: 27, text: 'True', order: 1 },
      { id: 28, text: 'False', order: 2 },
    ],
    correct_choices: [28],
  },
  {
    id: 13, text: 'Which of the following are valid loop constructs in Python? (Select all)', question_type: 'multi_select', order: 3, points: 2,
    explanation: 'Python has "for" and "while" loops. There is no "do-while" or "foreach" keyword in Python.',
    choices: [
      { id: 29, text: 'for', order: 1 },
      { id: 30, text: 'while', order: 2 },
      { id: 31, text: 'do-while', order: 3 },
      { id: 32, text: 'foreach', order: 4 },
    ],
    correct_choices: [29, 30],
  },
  {
    id: 14, text: 'The keyword to skip the current iteration and move to the next one is ________.', question_type: 'fill_blank', order: 4, points: 1,
    explanation: '"continue" skips the rest of the current loop iteration and moves to the next one.',
    correct_answer: 'continue',
  },
  {
    id: 15, text: 'Match each control flow keyword with its purpose:', question_type: 'matching', order: 5, points: 2,
    explanation: 'break exits a loop, continue skips to next iteration, pass does nothing, and else runs after a loop completes normally.',
    matching_pairs: [
      { left: 'break', right: 'Exit the loop immediately' },
      { left: 'continue', right: 'Skip to the next iteration' },
      { left: 'pass', right: 'Do nothing (placeholder)' },
      { left: 'else (on loop)', right: 'Runs when loop completes without break' },
    ],
  },
  {
    id: 16, text: 'What does range(2, 10, 3) produce?', question_type: 'multiple_choice', order: 6, points: 1,
    explanation: 'range(2, 10, 3) starts at 2, steps by 3: 2, 5, 8.',
    choices: [
      { id: 33, text: '[2, 5, 8]', order: 1 },
      { id: 34, text: '[2, 4, 6, 8]', order: 2 },
      { id: 35, text: '[2, 5, 8, 11]', order: 3 },
      { id: 36, text: '[3, 6, 9]', order: 4 },
    ],
    correct_choices: [33],
  },
  {
    id: 17, text: 'Explain what a list comprehension is and give an example of when you would use one.', question_type: 'short_answer', order: 7, points: 2,
    explanation: 'A list comprehension is a concise way to create lists. Example: [x**2 for x in range(10)] creates a list of squares.',
  },
  {
    id: 18, text: 'What is the output of: [x for x in range(6) if x % 2 == 0]?', question_type: 'multiple_choice', order: 8, points: 1,
    explanation: 'This filters even numbers from 0-5: 0, 2, 4.',
    choices: [
      { id: 37, text: '[0, 2, 4]', order: 1 },
      { id: 38, text: '[2, 4, 6]', order: 2 },
      { id: 39, text: '[1, 3, 5]', order: 3 },
      { id: 40, text: '[0, 2, 4, 6]', order: 4 },
    ],
    correct_choices: [37],
  },
  {
    id: 19, text: 'Python supports switch/case statements natively (before Python 3.10).', question_type: 'true_false', order: 9, points: 1,
    explanation: 'Before Python 3.10, there was no match/case. Python 3.10+ introduced structural pattern matching (match/case).',
    choices: [
      { id: 41, text: 'True', order: 1 },
      { id: 42, text: 'False', order: 2 },
    ],
    correct_choices: [42],
  },
  {
    id: 20, text: 'The keyword to prematurely exit a loop in Python is ________.', question_type: 'fill_blank', order: 10, points: 1,
    explanation: '"break" immediately terminates the innermost loop.',
    correct_answer: 'break',
  },
];

// ═══════════════════════════════════════════════
// QUIZ DATA — Module 3: Functions & Modules
// ═══════════════════════════════════════════════
const quiz3Questions: MockQuestion[] = [
  {
    id: 21, text: 'Which keyword is used to define a function in Python?', question_type: 'multiple_choice', order: 1, points: 1,
    explanation: 'Functions are defined with the "def" keyword followed by the function name and parentheses.',
    choices: [
      { id: 43, text: 'function', order: 1 },
      { id: 44, text: 'def', order: 2 },
      { id: 45, text: 'func', order: 3 },
      { id: 46, text: 'define', order: 4 },
    ],
    correct_choices: [44],
  },
  {
    id: 22, text: 'A function without a return statement returns None.', question_type: 'true_false', order: 2, points: 1,
    explanation: 'If no return statement is reached, Python functions implicitly return None.',
    choices: [
      { id: 47, text: 'True', order: 1 },
      { id: 48, text: 'False', order: 2 },
    ],
    correct_choices: [47],
  },
  {
    id: 23, text: 'Which of the following are valid parameter types in Python functions? (Select all)', question_type: 'multi_select', order: 3, points: 2,
    explanation: 'Python supports positional, keyword, *args (variable positional), and **kwargs (variable keyword) parameters.',
    choices: [
      { id: 49, text: 'Positional arguments', order: 1 },
      { id: 50, text: '*args', order: 2 },
      { id: 51, text: '**kwargs', order: 3 },
      { id: 52, text: '***params', order: 4 },
    ],
    correct_choices: [49, 50, 51],
  },
  {
    id: 24, text: 'The keyword to create an anonymous (inline) function in Python is ________.', question_type: 'fill_blank', order: 4, points: 1,
    explanation: 'Lambda functions are anonymous functions defined with the "lambda" keyword.',
    correct_answer: 'lambda',
  },
  {
    id: 25, text: 'Match each built-in function with what it does:', question_type: 'matching', order: 5, points: 2,
    explanation: 'len() returns length, map() applies a function to all items, filter() selects items matching a condition, zip() pairs elements from iterables.',
    matching_pairs: [
      { left: 'len()', right: 'Returns the number of items' },
      { left: 'map()', right: 'Applies function to each item' },
      { left: 'filter()', right: 'Selects items matching a condition' },
      { left: 'zip()', right: 'Pairs elements from multiple iterables' },
    ],
  },
  {
    id: 26, text: 'What is the output of: (lambda x, y: x + y)(3, 4)?', question_type: 'multiple_choice', order: 6, points: 1,
    explanation: 'This creates and immediately calls a lambda that adds its arguments: 3 + 4 = 7.',
    choices: [
      { id: 53, text: '34', order: 1 },
      { id: 54, text: '7', order: 2 },
      { id: 55, text: 'Error', order: 3 },
      { id: 56, text: 'None', order: 4 },
    ],
    correct_choices: [54],
  },
  {
    id: 27, text: 'Explain the difference between *args and **kwargs in function definitions.', question_type: 'short_answer', order: 7, points: 2,
    explanation: '*args collects extra positional arguments as a tuple. **kwargs collects extra keyword arguments as a dictionary.',
  },
  {
    id: 28, text: 'What does "import math" do?', question_type: 'multiple_choice', order: 8, points: 1,
    explanation: 'The import statement loads the entire math module, making its functions available via math.function_name.',
    choices: [
      { id: 57, text: 'Downloads the math library from the internet', order: 1 },
      { id: 58, text: 'Makes the math module available in your code', order: 2 },
      { id: 59, text: 'Creates a new file called math.py', order: 3 },
      { id: 60, text: 'Runs the math module as a script', order: 4 },
    ],
    correct_choices: [58],
  },
  {
    id: 29, text: 'Decorators modify functions at runtime.', question_type: 'true_false', order: 9, points: 1,
    explanation: 'Decorators wrap a function to extend its behavior without modifying the function\'s source code. They are applied at definition time.',
    choices: [
      { id: 61, text: 'True', order: 1 },
      { id: 62, text: 'False', order: 2 },
    ],
    correct_choices: [61],
  },
  {
    id: 30, text: 'To import only the sqrt function from the math module, you write: from math ________ sqrt.', question_type: 'fill_blank', order: 10, points: 1,
    explanation: 'The syntax is "from math import sqrt" to import a specific function.',
    correct_answer: 'import',
  },
];

// ═══════════════════════════════════════════════
// QUIZ DATA — Module 4: OOP
// ═══════════════════════════════════════════════
const quiz4Questions: MockQuestion[] = [
  {
    id: 31, text: 'What is the method that initializes a new object in Python called?', question_type: 'multiple_choice', order: 1, points: 1,
    explanation: '__init__ is the constructor method called when creating a new instance of a class.',
    choices: [
      { id: 63, text: '__start__', order: 1 },
      { id: 64, text: '__init__', order: 2 },
      { id: 65, text: '__new__', order: 3 },
      { id: 66, text: 'constructor', order: 4 },
    ],
    correct_choices: [64],
  },
  {
    id: 32, text: 'Python supports multiple inheritance.', question_type: 'true_false', order: 2, points: 1,
    explanation: 'Yes, a Python class can inherit from multiple parent classes: class Child(Parent1, Parent2).',
    choices: [
      { id: 67, text: 'True', order: 1 },
      { id: 68, text: 'False', order: 2 },
    ],
    correct_choices: [67],
  },
  {
    id: 33, text: 'Which of the following are pillars of OOP? (Select all)', question_type: 'multi_select', order: 3, points: 2,
    explanation: 'The four pillars of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction.',
    choices: [
      { id: 69, text: 'Encapsulation', order: 1 },
      { id: 70, text: 'Inheritance', order: 2 },
      { id: 71, text: 'Compilation', order: 3 },
      { id: 72, text: 'Polymorphism', order: 4 },
      { id: 73, text: 'Abstraction', order: 5 },
    ],
    correct_choices: [69, 70, 72, 73],
  },
  {
    id: 34, text: 'The first parameter of every instance method in Python is conventionally named ________.', question_type: 'fill_blank', order: 4, points: 1,
    explanation: 'By convention, the first parameter is "self", referring to the current instance.',
    correct_answer: 'self',
  },
  {
    id: 35, text: 'Match each OOP concept with its description:', question_type: 'matching', order: 5, points: 2,
    explanation: 'Encapsulation hides internal state, Inheritance allows code reuse, Polymorphism lets objects take different forms, Abstraction hides complexity.',
    matching_pairs: [
      { left: 'Encapsulation', right: 'Bundling data and methods, hiding internals' },
      { left: 'Inheritance', right: 'Creating new classes from existing ones' },
      { left: 'Polymorphism', right: 'Same interface, different implementations' },
      { left: 'Abstraction', right: 'Hiding complexity, showing only essentials' },
    ],
  },
  {
    id: 36, text: 'What does the super() function do?', question_type: 'multiple_choice', order: 6, points: 1,
    explanation: 'super() returns a proxy object that delegates method calls to a parent class, commonly used to call the parent __init__.',
    choices: [
      { id: 74, text: 'Creates a superclass', order: 1 },
      { id: 75, text: 'Calls a method from the parent class', order: 2 },
      { id: 76, text: 'Makes a method faster', order: 3 },
      { id: 77, text: 'Deletes the parent class', order: 4 },
    ],
    correct_choices: [75],
  },
  {
    id: 37, text: 'Explain the difference between a class variable and an instance variable.', question_type: 'short_answer', order: 7, points: 2,
    explanation: 'Class variables are shared across all instances (defined in the class body). Instance variables are unique to each object (defined with self.name in __init__).',
  },
  {
    id: 38, text: 'Which decorator makes a method accessible without creating an instance?', question_type: 'multiple_choice', order: 8, points: 1,
    explanation: '@staticmethod defines a method that doesn\'t need access to the instance (self) or class (cls).',
    choices: [
      { id: 78, text: '@classmethod', order: 1 },
      { id: 79, text: '@staticmethod', order: 2 },
      { id: 80, text: '@property', order: 3 },
      { id: 81, text: '@abstract', order: 4 },
    ],
    correct_choices: [79],
  },
  {
    id: 39, text: 'Private attributes in Python are truly inaccessible from outside the class.', question_type: 'true_false', order: 9, points: 1,
    explanation: 'Python doesn\'t have true private attributes. Name mangling (__attr becomes _ClassName__attr) makes them harder to access but not impossible.',
    choices: [
      { id: 82, text: 'True', order: 1 },
      { id: 83, text: 'False', order: 2 },
    ],
    correct_choices: [83],
  },
  {
    id: 40, text: 'To make a class abstract, you inherit from ABC and use the @________ decorator on methods.', question_type: 'fill_blank', order: 10, points: 1,
    explanation: 'The @abstractmethod decorator from the abc module marks methods that must be implemented by subclasses.',
    correct_answer: 'abstractmethod',
  },
];

// ═══════════════════════════════════════════════
// QUIZ DATA — Final Assessment
// ═══════════════════════════════════════════════
const assessmentQuestions: MockQuestion[] = [
  {
    id: 41, text: 'What is the output of: print("Hello"[1])?', question_type: 'multiple_choice', order: 1, points: 1,
    explanation: 'Strings are indexed from 0. Index 1 is "e".',
    choices: [
      { id: 84, text: 'H', order: 1 },
      { id: 85, text: 'e', order: 2 },
      { id: 86, text: 'l', order: 3 },
      { id: 87, text: 'Error', order: 4 },
    ],
    correct_choices: [85],
  },
  {
    id: 42, text: 'Python uses indentation to define code blocks.', question_type: 'true_false', order: 2, points: 1,
    explanation: 'Unlike languages that use braces {}, Python uses indentation (typically 4 spaces) to define code blocks.',
    choices: [
      { id: 88, text: 'True', order: 1 },
      { id: 89, text: 'False', order: 2 },
    ],
    correct_choices: [88],
  },
  {
    id: 43, text: 'Which of the following can be used as dictionary keys? (Select all)', question_type: 'multi_select', order: 3, points: 2,
    explanation: 'Dictionary keys must be hashable/immutable. Strings, integers, and tuples (of immutables) qualify. Lists are mutable and cannot be keys.',
    choices: [
      { id: 90, text: 'str', order: 1 },
      { id: 91, text: 'int', order: 2 },
      { id: 92, text: 'list', order: 3 },
      { id: 93, text: 'tuple', order: 4 },
    ],
    correct_choices: [90, 91, 93],
  },
  {
    id: 44, text: 'The built-in function to get the length of a list is ________.', question_type: 'fill_blank', order: 4, points: 1,
    explanation: 'len() returns the number of items in a sequence.',
    correct_answer: 'len',
  },
  {
    id: 45, text: 'Match each data structure with its characteristic:', question_type: 'matching', order: 5, points: 2,
    explanation: 'Lists are ordered and mutable, tuples are ordered and immutable, sets are unordered with unique elements, dicts store key-value pairs.',
    matching_pairs: [
      { left: 'list', right: 'Ordered, mutable sequence' },
      { left: 'tuple', right: 'Ordered, immutable sequence' },
      { left: 'set', right: 'Unordered, unique elements' },
      { left: 'dict', right: 'Key-value pairs' },
    ],
  },
  {
    id: 46, text: 'What is the purpose of __init__(self) in a class?', question_type: 'multiple_choice', order: 6, points: 1,
    explanation: '__init__ is the constructor that initializes a new object\'s attributes when the class is instantiated.',
    choices: [
      { id: 94, text: 'Deletes the object', order: 1 },
      { id: 95, text: 'Initializes the object\'s attributes', order: 2 },
      { id: 96, text: 'Imports necessary modules', order: 3 },
      { id: 97, text: 'Prints the object', order: 4 },
    ],
    correct_choices: [95],
  },
  {
    id: 47, text: 'Write a Python function that takes a list and returns only the even numbers.', question_type: 'short_answer', order: 7, points: 3,
    explanation: 'Example: def get_evens(lst): return [x for x in lst if x % 2 == 0]',
  },
  {
    id: 48, text: 'What does the "with" statement do when working with files?', question_type: 'multiple_choice', order: 8, points: 1,
    explanation: 'The "with" statement ensures proper resource management — the file is automatically closed when the block exits, even if an error occurs.',
    choices: [
      { id: 98, text: 'Creates a new file format', order: 1 },
      { id: 99, text: 'Automatically handles resource cleanup', order: 2 },
      { id: 100, text: 'Makes the file read-only', order: 3 },
      { id: 101, text: 'Encrypts the file', order: 4 },
    ],
    correct_choices: [99],
  },
  {
    id: 49, text: 'Python 3 strings are Unicode by default.', question_type: 'true_false', order: 9, points: 1,
    explanation: 'In Python 3, all strings are Unicode (str type). Python 2 had separate str and unicode types.',
    choices: [
      { id: 102, text: 'True', order: 1 },
      { id: 103, text: 'False', order: 2 },
    ],
    correct_choices: [102],
  },
  {
    id: 50, text: 'To handle exceptions in Python, you use try and ________.', question_type: 'fill_blank', order: 10, points: 1,
    explanation: 'The try/except block catches and handles exceptions.',
    correct_answer: 'except',
  },
];

// Backward-compatible correct answers map (for old code that might reference it)
export const mockCorrectAnswers: Record<number, number> = {
  1: 2, 2: 6, 3: 11, 4: 13, 5: 19, 6: 22, 7: 28, 8: 31, 9: 34, 10: 39,
};

export const mockQuizzes: Record<number, MockQuiz> = {
  1: {
    id: 1, title: { en: 'Python Basics Quiz' }, quiz_type: 'module_quiz',
    questions_count: 10, time_limit: 15, order: 1, questions: quiz1Questions,
  },
  2: {
    id: 2, title: { en: 'Control Flow Quiz' }, quiz_type: 'module_quiz',
    questions_count: 10, time_limit: 15, order: 2, questions: quiz2Questions,
  },
  3: {
    id: 3, title: { en: 'Functions & Modules Quiz' }, quiz_type: 'module_quiz',
    questions_count: 10, time_limit: 15, order: 3, questions: quiz3Questions,
  },
  4: {
    id: 4, title: { en: 'OOP Quiz' }, quiz_type: 'module_quiz',
    questions_count: 10, time_limit: 15, order: 4, questions: quiz4Questions,
  },
  5: {
    id: 5, title: { en: 'Python Final Assessment' }, quiz_type: 'assessment',
    questions_count: 10, time_limit: 30, order: 5, questions: assessmentQuestions,
  },
};

// Keep backward compat
export const mockQuiz: MockQuiz = mockQuizzes[1];

export const mockCourseLearn: MockCourseLearn = {
  id: 1,
  slug: 'introduction-to-python',
  title: { en: 'Introduction to Python' },
  description: { en: 'Learn Python from scratch — variables, loops, functions, OOP, and more.' },
  thumbnail: 'https://placehold.co/800x450/F97316/white?text=Python',
  level: 'beginner',
  instructor: 'Wayne LMS',
  modules: [
    {
      id: 1, title: { en: 'Python Basics' }, order: 1,
      quiz: { id: 1, title: { en: 'Python Basics Quiz' }, questions_count: 10 },
      lessons: [
        {
          id: 1, title: { en: 'Why Python?' }, lesson_type: 'video',
          content: { en: `<h2>Why Learn Python?</h2>
<p>Python is one of the most popular programming languages in the world — and for good reason. It's readable, versatile, and powers everything from web apps to artificial intelligence.</p>

<h3>🌍 Who Uses Python?</h3>
<ul>
  <li><strong>Instagram</strong> — The world's largest Django (Python) application, serving over 2 billion monthly users</li>
  <li><strong>Netflix</strong> — Uses Python for recommendation algorithms, data analysis, and content delivery infrastructure</li>
  <li><strong>Spotify</strong> — Python powers their data pipeline and music recommendation engine</li>
  <li><strong>Google</strong> — Python is one of Google's three "official languages." YouTube's backend started in Python</li>
  <li><strong>Dropbox</strong> — Their entire desktop client is written in Python</li>
  <li><strong>NASA</strong> — Uses Python for scientific computing and mission planning</li>
</ul>

<h3>🎯 What Can You Build With Python?</h3>
<ul>
  <li><strong>Web Applications</strong> — Django, Flask, FastAPI</li>
  <li><strong>Data Science & ML</strong> — NumPy, Pandas, TensorFlow, PyTorch</li>
  <li><strong>Automation & Scripting</strong> — Automate repetitive tasks</li>
  <li><strong>Game Development</strong> — Pygame</li>
  <li><strong>Desktop Applications</strong> — Tkinter, PyQt</li>
</ul>

<h3>📊 Python by the Numbers</h3>
<p>According to the <strong>TIOBE Index</strong> and <strong>Stack Overflow Developer Survey</strong>, Python has been the #1 most popular programming language since 2021. Over <strong>48% of developers</strong> use Python regularly.</p>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Python is beginner-friendly with clean, readable syntax</li>
  <li>Massive ecosystem of libraries and frameworks</li>
  <li>High demand in the job market — average salary of $120K+ in the US</li>
  <li>Great first language that teaches good programming habits</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/Y8Tko2YC5hA', video_duration: '12m 30s',
          quiz_id: null, assignment_id: null, duration: 12, order: 1,
        },
        {
          id: 2, title: { en: 'Installing Python & IDE Setup' }, lesson_type: 'video',
          content: { en: `<h2>Setting Up Your Python Environment</h2>
<p>Before writing your first line of code, you need to install Python and choose an editor. This lesson walks you through the process step by step.</p>

<h3>📥 Installing Python</h3>
<ol>
  <li>Visit <strong>python.org/downloads</strong></li>
  <li>Download the latest Python 3.x version (currently 3.12+)</li>
  <li><strong>Important:</strong> Check "Add Python to PATH" during installation on Windows</li>
  <li>Verify installation: open terminal and type <code>python --version</code></li>
</ol>

<h3>🛠️ Choosing an IDE</h3>
<table>
  <tr><th>IDE</th><th>Best For</th><th>Cost</th></tr>
  <tr><td><strong>VS Code</strong></td><td>General development, extensions</td><td>Free</td></tr>
  <tr><td><strong>PyCharm</strong></td><td>Professional Python development</td><td>Free Community / Paid Pro</td></tr>
  <tr><td><strong>Jupyter Notebook</strong></td><td>Data science, interactive coding</td><td>Free</td></tr>
  <tr><td><strong>IDLE</strong></td><td>Quick experiments (comes with Python)</td><td>Free</td></tr>
</table>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Always use Python 3 (Python 2 is no longer supported)</li>
  <li>VS Code with the Python extension is the most popular choice</li>
  <li>Use virtual environments to manage project dependencies</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/YYXdXT2l-Gg', video_duration: '8m 15s',
          quiz_id: null, assignment_id: null, duration: 8, order: 2,
        },
        {
          id: 3, title: { en: 'Hello World!' }, lesson_type: 'exercise',
          content: { en: `<h2>Your First Python Program</h2>
<p>Every programmer's journey begins with "Hello, World!" — a simple program that displays text on the screen. It's a tradition that dates back to the 1978 book <em>The C Programming Language</em> by Kernighan and Ritchie.</p>

<h3>The Code</h3>
<pre><code>print("Hello, World!")</code></pre>

<p>That's it! Just one line. Compare this to Java, which needs a class, a main method, and curly braces for the same thing.</p>

<h3>🧪 Try These Variations</h3>
<pre><code># Print your name
print("Hello, my name is Alice!")

# Print multiple lines
print("Line 1")
print("Line 2")

# Print with special characters
print("It's a beautiful day!")
print("She said \\"hello\\"")

# Print numbers
print(42)
print(3.14)

# Print with concatenation
name = "World"
print("Hello, " + name + "!")</code></pre>

<h3>📝 Exercise</h3>
<p>Write a program that prints:</p>
<ol>
  <li>Your name</li>
  <li>Your favorite programming language</li>
  <li>Why you want to learn Python</li>
</ol>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 10, order: 3,
        },
        {
          id: 4, title: { en: 'Variables & Data Types' }, lesson_type: 'video',
          content: { en: `<h2>Variables & Data Types</h2>
<p>Variables are like labeled containers that store data. Unlike languages like Java or C++, Python doesn't require you to declare a variable's type — it figures it out automatically (this is called <strong>dynamic typing</strong>).</p>

<h3>Creating Variables</h3>
<pre><code># No keyword needed — just assign!
name = "Alice"          # str (string)
age = 25                # int (integer)
height = 5.7            # float (decimal)
is_student = True       # bool (boolean)
skills = ["Python", "SQL"]  # list</code></pre>

<h3>🔢 Core Data Types</h3>
<table>
  <tr><th>Type</th><th>Example</th><th>Description</th></tr>
  <tr><td><code>int</code></td><td>42, -7, 0</td><td>Whole numbers (unlimited size!)</td></tr>
  <tr><td><code>float</code></td><td>3.14, -0.5</td><td>Decimal numbers</td></tr>
  <tr><td><code>str</code></td><td>"hello", 'world'</td><td>Text (immutable)</td></tr>
  <tr><td><code>bool</code></td><td>True, False</td><td>Boolean values</td></tr>
  <tr><td><code>list</code></td><td>[1, 2, 3]</td><td>Ordered, mutable collection</td></tr>
  <tr><td><code>tuple</code></td><td>(1, 2, 3)</td><td>Ordered, immutable collection</td></tr>
  <tr><td><code>dict</code></td><td>{"key": "value"}</td><td>Key-value pairs</td></tr>
  <tr><td><code>set</code></td><td>{1, 2, 3}</td><td>Unordered, unique values</td></tr>
  <tr><td><code>None</code></td><td>None</td><td>Represents "nothing"</td></tr>
</table>

<h3>🔄 Type Conversion</h3>
<pre><code>age_str = "25"
age_int = int(age_str)     # String → Integer
price = float("19.99")     # String → Float
text = str(42)             # Integer → String</code></pre>

<h3>🏢 Real-World Example</h3>
<p>At <strong>Uber</strong>, variables might store ride data:</p>
<pre><code>rider_name = "Sarah"
pickup_lat = 25.2048
pickup_lng = 55.2708
ride_fare = 45.50
is_pool = False
stops = ["Mall", "Airport"]</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Python variables don't need type declarations</li>
  <li>Use <code>type()</code> to check a variable's type</li>
  <li>Naming convention: use <code>snake_case</code> for variables</li>
  <li>Constants use <code>UPPER_CASE</code> by convention</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/cQT33yu9pY8', video_duration: '15m 42s',
          quiz_id: null, assignment_id: null, duration: 15, order: 4,
        },
        {
          id: 5, title: { en: 'Operators & Expressions' }, lesson_type: 'text',
          content: { en: `<h2>Operators & Expressions</h2>
<p>Operators are symbols that tell Python to perform specific computations. Understanding operators is essential — they're the building blocks of every calculation, comparison, and logical decision in your code.</p>

<h3>➕ Arithmetic Operators</h3>
<pre><code>a, b = 17, 5

print(a + b)    # 22  — Addition
print(a - b)    # 12  — Subtraction
print(a * b)    # 85  — Multiplication
print(a / b)    # 3.4 — Division (always returns float)
print(a // b)   # 3   — Floor division (rounds down)
print(a % b)    # 2   — Modulo (remainder)
print(a ** b)   # 1419857 — Exponentiation (17^5)</code></pre>

<h3>🔍 Comparison Operators</h3>
<pre><code>x, y = 10, 20

print(x == y)   # False — Equal to
print(x != y)   # True  — Not equal
print(x < y)    # True  — Less than
print(x > y)    # False — Greater than
print(x <= y)   # True  — Less than or equal
print(x >= y)   # False — Greater than or equal</code></pre>

<h3>🧠 Logical Operators</h3>
<pre><code>age = 25
has_license = True

# and — both must be True
can_drive = age >= 18 and has_license  # True

# or — at least one must be True
can_enter = age >= 21 or has_vip_pass  # depends

# not — reverses the boolean
is_minor = not (age >= 18)  # False</code></pre>

<h3>🏢 Real-World Example: E-Commerce Pricing</h3>
<p>Amazon's pricing engine uses operators constantly:</p>
<pre><code># Calculate discount
original_price = 99.99
discount_percent = 20
discount_amount = original_price * (discount_percent / 100)  # 19.998
final_price = original_price - discount_amount  # 79.992

# Check if free shipping applies
order_total = 150.00
free_shipping = order_total >= 100  # True

# Tax calculation
tax_rate = 0.05  # 5% VAT
tax = final_price * tax_rate
total = final_price + tax</code></pre>

<h3>⚡ Shorthand Assignment Operators</h3>
<pre><code>score = 100
score += 10    # score = score + 10 → 110
score -= 5     # score = score - 5  → 105
score *= 2     # score = score * 2  → 210
score //= 3    # score = score // 3 → 70</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li><code>/</code> always returns a float; use <code>//</code> for integer division</li>
  <li><code>**</code> is for exponentiation (not <code>^</code>, which is bitwise XOR in Python)</li>
  <li><code>%</code> is great for checking even/odd: <code>n % 2 == 0</code></li>
  <li>Python supports chained comparisons: <code>1 < x < 10</code></li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 11, order: 5,
        },
      ],
    },
    {
      id: 2, title: { en: 'Control Flow' }, order: 2,
      quiz: { id: 2, title: { en: 'Control Flow Quiz' }, questions_count: 10 },
      lessons: [
        {
          id: 6, title: { en: 'Introduction to Control Flow' }, lesson_type: 'text',
          content: { en: `<h2>Why Control Flow Matters</h2>
<p>Without control flow, programs would execute every line from top to bottom — like reading a book with no choices. Control flow lets your programs make <strong>decisions</strong>, <strong>repeat actions</strong>, and <strong>respond to conditions</strong>.</p>

<h3>🌍 Real-World Control Flow</h3>
<p>Every app you use relies on control flow:</p>
<ul>
  <li><strong>Netflix</strong> — If your subscription is active, show content; otherwise, show payment page</li>
  <li><strong>Uber</strong> — While waiting for a driver, keep checking for available rides nearby</li>
  <li><strong>Gmail</strong> — For each email in inbox, check spam filters, then display or quarantine</li>
  <li><strong>ATM Machines</strong> — If balance >= withdrawal amount, dispense cash; else show "Insufficient funds"</li>
</ul>

<h3>🧩 The Three Types of Control Flow</h3>
<ol>
  <li><strong>Conditional Statements</strong> (if/elif/else) — Make decisions based on conditions</li>
  <li><strong>Loops</strong> (for/while) — Repeat blocks of code</li>
  <li><strong>Exception Handling</strong> (try/except) — Handle errors gracefully</li>
</ol>

<h3>💡 In This Module, You'll Learn</h3>
<ul>
  <li>How to use if/elif/else for decision-making</li>
  <li>For loops and while loops for repetition</li>
  <li>List comprehensions for elegant one-liner loops</li>
  <li>Building a real project: a Number Guessing Game</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 8, order: 1,
        },
        {
          id: 7, title: { en: 'If/Else Statements' }, lesson_type: 'video',
          content: { en: `<h2>Conditional Statements</h2>
<p>Conditional statements let your program choose different paths based on conditions. Think of them as "forks in the road."</p>

<h3>Basic Syntax</h3>
<pre><code>age = 20

if age >= 18:
    print("You can vote! 🗳️")
elif age >= 16:
    print("Almost there — you can drive!")
else:
    print("You're still young!")</code></pre>

<h3>🏢 Real-World: Uber Surge Pricing</h3>
<pre><code>demand_multiplier = 2.5

if demand_multiplier >= 3.0:
    print("Extreme surge — consider waiting")
elif demand_multiplier >= 1.5:
    print(f"Surge pricing: {demand_multiplier}x")
else:
    print("Normal pricing")</code></pre>

<h3>Ternary (One-Line) Conditional</h3>
<pre><code>status = "adult" if age >= 18 else "minor"</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Indentation is crucial — Python uses it to define code blocks</li>
  <li>You can chain as many <code>elif</code> blocks as needed</li>
  <li><code>else</code> is optional but catches all remaining cases</li>
  <li>Conditions can use <code>and</code>, <code>or</code>, <code>not</code> for complex logic</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/Zp5MuPOtsSY', video_duration: '14m 05s',
          quiz_id: null, assignment_id: null, duration: 14, order: 2,
        },
        {
          id: 8, title: { en: 'For & While Loops' }, lesson_type: 'video',
          content: { en: `<h2>Loops — Repeating Actions</h2>
<p>Loops let you execute a block of code multiple times. Python has two types: <code>for</code> loops (iterate over a sequence) and <code>while</code> loops (repeat until a condition is false).</p>

<h3>For Loops</h3>
<pre><code># Iterate over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I love {fruit}!")

# Use range() for numeric sequences
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2): # 2, 4, 6, 8
    print(i)</code></pre>

<h3>While Loops</h3>
<pre><code># Keep asking until correct password
password = ""
while password != "python123":
    password = input("Enter password: ")
print("Access granted!")</code></pre>

<h3>Loop Control: break & continue</h3>
<pre><code># break — exit the loop early
for num in range(100):
    if num == 5:
        break       # Stop at 5
    print(num)      # Prints 0-4

# continue — skip current iteration
for num in range(10):
    if num % 2 == 0:
        continue    # Skip even numbers
    print(num)      # Prints 1, 3, 5, 7, 9</code></pre>

<h3>🏢 Real-World: Spotify Playlist</h3>
<pre><code>playlist = ["Bohemian Rhapsody", "Imagine", "Hotel California"]
for i, song in enumerate(playlist, 1):
    print(f"{i}. Now playing: {song} 🎵")</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Use <code>for</code> when you know how many iterations you need</li>
  <li>Use <code>while</code> when you don't know when to stop</li>
  <li><code>enumerate()</code> gives you both index and value</li>
  <li>Always ensure while loops have a way to end (avoid infinite loops!)</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/6iF8Xb7Z3wQ', video_duration: '18m 30s',
          quiz_id: null, assignment_id: null, duration: 18, order: 3,
        },
        {
          id: 9, title: { en: 'List Comprehensions' }, lesson_type: 'text',
          content: { en: `<h2>List Comprehensions — Python's Superpower</h2>
<p>List comprehensions let you create lists in a single, elegant line. They're one of Python's most beloved features and a hallmark of "Pythonic" code.</p>

<h3>Basic Syntax</h3>
<pre><code># Traditional way
squares = []
for x in range(10):
    squares.append(x ** 2)

# List comprehension — same thing, one line!
squares = [x ** 2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]</code></pre>

<h3>With Filtering</h3>
<pre><code># Only even squares
even_squares = [x ** 2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]

# Filter and transform
names = ["alice", "BOB", "Charlie", "dave"]
capitalized = [name.title() for name in names if len(name) > 3]
# ['Alice', 'Charlie', 'Dave']</code></pre>

<h3>Nested Comprehensions</h3>
<pre><code># Flatten a 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]</code></pre>

<h3>Dict & Set Comprehensions</h3>
<pre><code># Dictionary comprehension
word_lengths = {word: len(word) for word in ["hello", "world", "python"]}
# {'hello': 5, 'world': 5, 'python': 6}

# Set comprehension (unique values)
unique_lengths = {len(word) for word in ["hello", "world", "python"]}
# {5, 6}</code></pre>

<h3>🏢 Real-World: Data Processing at Spotify</h3>
<pre><code># Filter songs by duration (under 4 minutes)
songs = [
    {"title": "Blinding Lights", "duration": 200},
    {"title": "Bohemian Rhapsody", "duration": 354},
    {"title": "Bad Guy", "duration": 194},
]
short_songs = [s["title"] for s in songs if s["duration"] < 240]
# ['Blinding Lights', 'Bad Guy']</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>List comprehensions are faster than traditional loops (optimized in CPython)</li>
  <li>Don't overdo it — if it's hard to read, use a regular loop</li>
  <li>Use generator expressions <code>(x for x in ...)</code> for memory efficiency with large datasets</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 10, order: 4,
        },
        {
          id: 10, title: { en: 'Build a Number Guessing Game' }, lesson_type: 'exercise',
          content: { en: `<h2>🎮 Project: Number Guessing Game</h2>
<p>Let's put everything together! You'll build a CLI game that generates a random number and gives the player hints until they guess correctly.</p>

<h3>Requirements</h3>
<ul>
  <li>Generate a random number between 1 and 100</li>
  <li>Ask the user to guess</li>
  <li>Give hints: "Too high!" or "Too low!"</li>
  <li>Track the number of attempts</li>
  <li>Allow the player to quit by typing "quit"</li>
</ul>

<h3>Starter Code</h3>
<pre><code>import random

secret = random.randint(1, 100)
attempts = 0
max_attempts = 10

print("🎯 Welcome to the Number Guessing Game!")
print(f"I'm thinking of a number between 1 and 100.")
print(f"You have {max_attempts} attempts. Good luck!\\n")

while attempts < max_attempts:
    guess_input = input(f"Attempt {attempts + 1}/{max_attempts} — Your guess: ")

    if guess_input.lower() == "quit":
        print(f"\\nThe number was {secret}. Better luck next time!")
        break

    # TODO: Convert to integer, handle errors
    # TODO: Compare guess to secret
    # TODO: Print "Too high!", "Too low!", or "Correct!"
    # TODO: Increment attempts

    attempts += 1
else:
    print(f"\\n😔 Out of attempts! The number was {secret}.")</code></pre>

<h3>🌟 Bonus Challenges</h3>
<ol>
  <li>Add difficulty levels (Easy: 20 attempts, Medium: 10, Hard: 5)</li>
  <li>Keep a high score across multiple games</li>
  <li>Add a "hint" option that narrows the range</li>
</ol>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 30, order: 5,
        },
        {
          id: 17, title: { en: 'Essay: Control Flow Best Practices' }, lesson_type: 'assignment',
          content: { en: `<h2>📝 Assignment: Control Flow Best Practices</h2>
<p>Write a short essay (300-500 words) discussing best practices for using control flow in Python. Cover topics like:</p>
<ul>
  <li>When to use <code>if/elif</code> vs. dictionary dispatch</li>
  <li>Avoiding deeply nested conditions</li>
  <li>Guard clauses and early returns</li>
  <li>When to choose <code>for</code> vs. <code>while</code></li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 3, duration: 30, order: 6,
        },
      ],
    },
    {
      id: 3, title: { en: 'Functions & Modules' }, order: 3,
      quiz: { id: 3, title: { en: 'Functions Quiz' }, questions_count: 10 },
      lessons: [
        {
          id: 11, title: { en: 'Why Functions Matter' }, lesson_type: 'text',
          content: { en: `<h2>Why Functions Matter</h2>
<p>Functions are the backbone of organized, reusable code. Without functions, you'd copy-paste the same logic everywhere — and every bug fix would mean updating dozens of places.</p>

<h3>🌍 Functions in the Real World</h3>
<ul>
  <li><strong>Stripe</strong> — Payment processing is broken into functions: validate_card(), charge_amount(), send_receipt()</li>
  <li><strong>Twitter/X</strong> — Functions handle tweet validation, character counting, hashtag parsing</li>
  <li><strong>Tesla Autopilot</strong> — Sensor data processing uses thousands of specialized functions</li>
</ul>

<h3>🧩 Benefits of Functions</h3>
<ol>
  <li><strong>DRY (Don't Repeat Yourself)</strong> — Write once, use everywhere</li>
  <li><strong>Readability</strong> — <code>calculate_tax(price)</code> is clearer than 5 lines of math</li>
  <li><strong>Testing</strong> — Small functions are easy to test individually</li>
  <li><strong>Collaboration</strong> — Team members can work on different functions simultaneously</li>
</ol>

<h3>💡 In This Module</h3>
<ul>
  <li>Defining and calling functions</li>
  <li>Parameters, return values, and scope</li>
  <li>Lambda functions and closures</li>
  <li>Importing and creating modules</li>
  <li>Building a calculator project</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 8, order: 1,
        },
        {
          id: 12, title: { en: 'Defining Functions' }, lesson_type: 'video',
          content: { en: `<h2>Defining Functions</h2>
<p>A function is a reusable block of code that performs a specific task. In Python, you define one with the <code>def</code> keyword.</p>

<h3>Basic Syntax</h3>
<pre><code>def greet(name):
    """Greet a user by name."""
    return f"Hello, {name}! Welcome to Python."

# Call the function
message = greet("Alice")
print(message)  # Hello, Alice! Welcome to Python.</code></pre>

<h3>Parameters & Arguments</h3>
<pre><code># Default parameters
def power(base, exponent=2):
    return base ** exponent

print(power(3))       # 9 (uses default exponent=2)
print(power(3, 3))    # 27

# Keyword arguments
def create_user(name, age, role="student"):
    return {"name": name, "age": age, "role": role}

user = create_user(age=25, name="Bob")  # Order doesn't matter with keywords</code></pre>

<h3>*args and **kwargs</h3>
<pre><code># Accept any number of positional arguments
def total(*prices):
    return sum(prices)

print(total(10, 20, 30))  # 60

# Accept any keyword arguments
def build_profile(**info):
    return info

profile = build_profile(name="Alice", age=30, city="Dubai")
# {'name': 'Alice', 'age': 30, 'city': 'Dubai'}</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Always add docstrings to describe what your function does</li>
  <li>Functions should do ONE thing well (Single Responsibility Principle)</li>
  <li>Use type hints for clarity: <code>def greet(name: str) -> str:</code></li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/9Os0o3wzS_I', video_duration: '16m 45s',
          quiz_id: null, assignment_id: null, duration: 16, order: 2,
        },
        {
          id: 13, title: { en: 'Parameters & Return Values' }, lesson_type: 'video',
          content: { en: `<h2>Parameters & Return Values — Deep Dive</h2>
<p>Understanding how data flows in and out of functions is crucial for writing clean, predictable code.</p>

<h3>Return Multiple Values</h3>
<pre><code>def divide(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder  # Returns a tuple

q, r = divide(17, 5)
print(f"17 ÷ 5 = {q} remainder {r}")  # 3 remainder 2</code></pre>

<h3>Scope — Local vs Global</h3>
<pre><code>total = 0  # Global variable

def add_to_total(amount):
    global total
    total += amount  # Modifies global variable

add_to_total(10)
print(total)  # 10</code></pre>

<h3>🏢 Real-World: Payment Processing</h3>
<pre><code>def process_payment(amount, currency="USD", discount=0):
    """Process a payment with optional discount."""
    discounted = amount * (1 - discount / 100)
    fee = discounted * 0.029 + 0.30  # Stripe's fee structure
    net = discounted - fee
    return {
        "charged": round(discounted, 2),
        "fee": round(fee, 2),
        "net": round(net, 2),
        "currency": currency
    }

result = process_payment(100, discount=10)
# {'charged': 90.0, 'fee': 2.91, 'net': 87.09, 'currency': 'USD'}</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Avoid using <code>global</code> — pass data through parameters instead</li>
  <li>Functions can return any type, including other functions</li>
  <li>Use unpacking to capture multiple return values</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/9Os0o3wzS_I', video_duration: '13m 20s',
          quiz_id: null, assignment_id: null, duration: 13, order: 3,
        },
        {
          id: 14, title: { en: 'Importing Modules' }, lesson_type: 'text',
          content: { en: `<h2>Modules — Organizing Your Code</h2>
<p>Modules are Python files that contain functions, classes, and variables. They let you organize code into reusable packages. Python's huge standard library has modules for almost everything.</p>

<h3>Importing Modules</h3>
<pre><code># Import entire module
import math
print(math.pi)        # 3.141592653589793
print(math.sqrt(16))  # 4.0

# Import specific functions
from math import sqrt, pi
print(sqrt(25))  # 5.0

# Import with alias
import datetime as dt
now = dt.datetime.now()

# Import everything (not recommended)
from math import *</code></pre>

<h3>📦 Popular Standard Library Modules</h3>
<table>
  <tr><th>Module</th><th>Purpose</th><th>Example</th></tr>
  <tr><td><code>os</code></td><td>Operating system operations</td><td><code>os.listdir(".")</code></td></tr>
  <tr><td><code>json</code></td><td>JSON parsing</td><td><code>json.loads(data)</code></td></tr>
  <tr><td><code>random</code></td><td>Random numbers</td><td><code>random.randint(1, 100)</code></td></tr>
  <tr><td><code>datetime</code></td><td>Date/time handling</td><td><code>datetime.now()</code></td></tr>
  <tr><td><code>re</code></td><td>Regular expressions</td><td><code>re.findall(pattern, text)</code></td></tr>
  <tr><td><code>collections</code></td><td>Specialized containers</td><td><code>Counter, defaultdict</code></td></tr>
</table>

<h3>Creating Your Own Module</h3>
<pre><code># myutils.py
def celsius_to_fahrenheit(c):
    return c * 9/5 + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

# main.py
from myutils import celsius_to_fahrenheit
print(celsius_to_fahrenheit(30))  # 86.0</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li>Use <code>from module import function</code> for cleaner code</li>
  <li>Avoid <code>from module import *</code> — it pollutes the namespace</li>
  <li>Use <code>pip install</code> for third-party packages (requests, pandas, etc.)</li>
  <li>Create a <code>__init__.py</code> file to make a directory a package</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 11, order: 4,
        },
        {
          id: 15, title: { en: 'Build a Calculator' }, lesson_type: 'assignment',
          content: { en: `<h2>🧮 Project: Build a Calculator</h2>
<p>Create a calculator program that demonstrates your understanding of functions and modules.</p>

<h3>Requirements</h3>
<ol>
  <li>Create a module <code>calculator.py</code> with functions: <code>add</code>, <code>subtract</code>, <code>multiply</code>, <code>divide</code></li>
  <li>Handle division by zero gracefully</li>
  <li>Create a <code>main.py</code> that imports your calculator module</li>
  <li>Build a CLI menu that lets users choose operations</li>
  <li>Support continuous calculations (use previous result)</li>
</ol>

<h3>Starter Code</h3>
<pre><code># calculator.py
def add(a, b):
    """Return the sum of a and b."""
    return a + b

def divide(a, b):
    """Return a divided by b. Raises ValueError if b is 0."""
    if b == 0:
        raise ValueError("Cannot divide by zero!")
    return a / b

# TODO: Add subtract, multiply, power, modulo</code></pre>

<h3>🌟 Bonus</h3>
<ul>
  <li>Add scientific functions (sqrt, sin, cos) using the math module</li>
  <li>Add a history feature that tracks all calculations</li>
  <li>Support expression parsing: "2 + 3 * 4"</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 2, duration: 30, order: 5,
        },
      ],
    },
    {
      id: 4, title: { en: 'Object-Oriented Programming' }, order: 4,
      quiz: { id: 4, title: { en: 'OOP Quiz' }, questions_count: 10 },
      lessons: [
        {
          id: 16, title: { en: 'Introduction to OOP' }, lesson_type: 'text',
          content: { en: `<h2>Why Object-Oriented Programming?</h2>
<p>Object-Oriented Programming (OOP) is a way of organizing code around <strong>objects</strong> — things that have properties (data) and behaviors (methods). It's the dominant programming paradigm used in modern software.</p>

<h3>🌍 OOP Powers the World's Biggest Apps</h3>
<ul>
  <li><strong>Instagram</strong> — User, Post, Story, Comment are all classes in their Django backend</li>
  <li><strong>YouTube</strong> — Video, Channel, Playlist, Comment — each is an object with properties and methods</li>
  <li><strong>Minecraft</strong> — Every block, mob, item, and player is an object</li>
  <li><strong>Banking Systems</strong> — Account, Transaction, Customer — OOP models real-world entities</li>
</ul>

<h3>🧱 The Four Pillars of OOP</h3>
<ol>
  <li><strong>Encapsulation</strong> — Bundle data and methods together, hide internals</li>
  <li><strong>Inheritance</strong> — Create new classes based on existing ones (code reuse)</li>
  <li><strong>Polymorphism</strong> — Same method name, different behavior depending on the object</li>
  <li><strong>Abstraction</strong> — Hide complexity, show only what's necessary</li>
</ol>

<h3>Procedural vs OOP</h3>
<pre><code># Procedural approach
account_balance = 1000
def withdraw(balance, amount):
    return balance - amount

# OOP approach
class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        self.balance -= amount
        return self.balance</code></pre>

<h3>💡 In This Module</h3>
<ul>
  <li>Creating classes and objects</li>
  <li>The __init__ constructor and self</li>
  <li>Inheritance and method overriding</li>
  <li>Polymorphism and magic methods</li>
  <li>Building a Student Management System</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: null, duration: 10, order: 1,
        },
        {
          id: 18, title: { en: 'Classes & Objects' }, lesson_type: 'video',
          content: { en: `<h2>Classes & Objects</h2>
<p>A <strong>class</strong> is a blueprint. An <strong>object</strong> is an instance created from that blueprint. Think of a class as a cookie cutter and objects as the cookies.</p>

<h3>Creating a Class</h3>
<pre><code>class Dog:
    # Class variable (shared by all instances)
    species = "Canis familiaris"

    def __init__(self, name, age, breed):
        # Instance variables (unique to each object)
        self.name = name
        self.age = age
        self.breed = breed

    def bark(self):
        return f"{self.name} says Woof! 🐕"

    def describe(self):
        return f"{self.name} is a {self.age}-year-old {self.breed}"

# Create objects
rex = Dog("Rex", 3, "German Shepherd")
bella = Dog("Bella", 1, "Golden Retriever")

print(rex.bark())      # Rex says Woof! 🐕
print(bella.describe()) # Bella is a 1-year-old Golden Retriever</code></pre>

<h3>Magic Methods (Dunder Methods)</h3>
<pre><code>class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name}: \${self.price}"

    def __repr__(self):
        return f"Product('{self.name}', {self.price})"

    def __eq__(self, other):
        return self.price == other.price

    def __lt__(self, other):
        return self.price < other.price

p = Product("Laptop", 999)
print(p)  # Laptop: $999</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li><code>self</code> refers to the current instance — always the first parameter</li>
  <li><code>__init__</code> runs automatically when you create a new object</li>
  <li>Class variables are shared; instance variables are unique</li>
  <li>Magic methods let your objects work with built-in operators</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/ZDa-Z5JzLYM', video_duration: '20m 10s',
          quiz_id: null, assignment_id: null, duration: 20, order: 2,
        },
        {
          id: 19, title: { en: 'Inheritance & Polymorphism' }, lesson_type: 'video',
          content: { en: `<h2>Inheritance & Polymorphism</h2>
<p><strong>Inheritance</strong> lets you create new classes based on existing ones. The child class inherits all attributes and methods from the parent, and can add or override them.</p>

<h3>Basic Inheritance</h3>
<pre><code>class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def speak(self):
        return f"{self.name} says {self.sound}!"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Woof")  # Call parent constructor
        self.breed = breed

    def fetch(self):
        return f"{self.name} fetches the ball! 🎾"

class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "Meow")

    def purr(self):
        return f"{self.name} purrs... 😺"

dog = Dog("Rex", "Labrador")
cat = Cat("Whiskers")

print(dog.speak())   # Rex says Woof!
print(dog.fetch())   # Rex fetches the ball! 🎾
print(cat.speak())   # Whiskers says Meow!</code></pre>

<h3>Polymorphism</h3>
<pre><code># Same interface, different behavior
animals = [Dog("Rex", "Lab"), Cat("Whiskers")]
for animal in animals:
    print(animal.speak())  # Each speaks differently!</code></pre>

<h3>🏢 Real-World: Payment System</h3>
<pre><code>class Payment:
    def process(self, amount):
        raise NotImplementedError

class CreditCard(Payment):
    def process(self, amount):
        return f"Charged \${amount} to credit card"

class PayPal(Payment):
    def process(self, amount):
        return f"Sent \${amount} via PayPal"

class Crypto(Payment):
    def process(self, amount):
        return f"Transferred \${amount} in Bitcoin"

# Polymorphism in action
payments = [CreditCard(), PayPal(), Crypto()]
for p in payments:
    print(p.process(50))  # Same method, different implementations</code></pre>

<h3>💡 Key Takeaways</h3>
<ul>
  <li><code>super()</code> calls the parent class's method</li>
  <li>Python supports multiple inheritance (but use it carefully)</li>
  <li>Polymorphism = same method name, different behavior per class</li>
  <li>Use <code>isinstance()</code> to check an object's type</li>
</ul>` },
          video_url: 'https://www.youtube.com/embed/Cn7AkDb4pIU', video_duration: '22m 35s',
          quiz_id: null, assignment_id: null, duration: 22, order: 3,
        },
        {
          id: 20, title: { en: 'Build a Student Management System' }, lesson_type: 'assignment',
          content: { en: `<h2>🎓 Project: Student Management System</h2>
<p>Build a complete OOP project that manages students, courses, and grades.</p>

<h3>Requirements</h3>
<ol>
  <li>Create a <code>Person</code> base class with name, age, email</li>
  <li>Create <code>Student</code> and <code>Instructor</code> classes that inherit from <code>Person</code></li>
  <li>Create a <code>Course</code> class with title, instructor, and enrolled students</li>
  <li>Students can enroll/drop courses and receive grades</li>
  <li>Calculate GPA for each student</li>
  <li>Generate a report card (formatted output)</li>
</ol>

<h3>Starter Code</h3>
<pre><code>class Person:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

    def __str__(self):
        return f"{self.name} ({self.email})"

class Student(Person):
    def __init__(self, name, age, email, student_id):
        super().__init__(name, age, email)
        self.student_id = student_id
        self.courses = {}  # {course_name: grade}

    def enroll(self, course):
        # TODO: Add student to course
        pass

    def get_gpa(self):
        # TODO: Calculate GPA
        pass</code></pre>

<h3>🌟 Bonus</h3>
<ul>
  <li>Save/load data using JSON files</li>
  <li>Add a CLI menu for CRUD operations</li>
  <li>Implement search functionality</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 1, duration: 45, order: 4,
        },
        {
          id: 21, title: { en: 'Upload: OOP Class Diagram' }, lesson_type: 'assignment',
          content: { en: `<h2>📊 Assignment: OOP Class Diagram</h2>
<p>Create a UML class diagram for your Student Management System. Show:</p>
<ul>
  <li>All classes with their attributes and methods</li>
  <li>Inheritance relationships (arrows)</li>
  <li>Associations between classes</li>
</ul>
<p>You can use tools like <strong>draw.io</strong>, <strong>Lucidchart</strong>, or even pen and paper (take a photo).</p>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 4, duration: 20, order: 5,
        },
        {
          id: 22, title: { en: 'Submit: Portfolio Project URL' }, lesson_type: 'assignment',
          content: { en: `<h2>🔗 Submit Your Portfolio Project</h2>
<p>Push your Student Management System to GitHub and submit the repository URL.</p>
<h3>Checklist</h3>
<ul>
  <li>✅ Code is well-organized with proper class structure</li>
  <li>✅ README.md with project description and usage instructions</li>
  <li>✅ At least 3 classes with inheritance</li>
  <li>✅ Docstrings on all classes and methods</li>
</ul>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 5, duration: 15, order: 6,
        },
        {
          id: 23, title: { en: 'Final Project: Complete Python App' }, lesson_type: 'assignment',
          content: { en: `<h2>🚀 Final Project: Complete Python Application</h2>
<p>Build a complete Python application of your choice that demonstrates everything you've learned in this course.</p>

<h3>Requirements</h3>
<ul>
  <li>Use OOP with at least 3 classes and inheritance</li>
  <li>Use modules and imports properly</li>
  <li>Handle errors with try/except</li>
  <li>Use file I/O (read/write JSON or CSV)</li>
  <li>Include a README with documentation</li>
</ul>

<h3>Project Ideas</h3>
<ol>
  <li><strong>Library Management System</strong> — Track books, members, borrowing</li>
  <li><strong>Expense Tracker</strong> — Log expenses, categories, monthly reports</li>
  <li><strong>Quiz Game</strong> — Load questions from a file, track scores</li>
  <li><strong>Contact Book</strong> — CRUD operations with file storage</li>
  <li><strong>Weather Dashboard</strong> — Fetch data from an API and display it</li>
</ol>` },
          video_url: '', video_duration: '',
          quiz_id: null, assignment_id: 6, duration: 60, order: 7,
        },
      ],
    },
  ],
  assessment: { id: 5, title: { en: 'Python Final Assessment' }, questions_count: 10 },
  progress: { completed_lessons: [1, 2], total_lessons: 20, percent: 10 },
};

export const mockComments = [
  { id: 1, content: 'Great explanation! Very clear.', created_at: '2025-12-01T10:30:00Z', parent: null, user_name: 'Ahmed K.', user_avatar: '', replies: [
    { id: 3, content: 'I agree, really helpful!', created_at: '2025-12-01T11:00:00Z', parent: 1, user_name: 'Sarah M.', user_avatar: '', replies: [] },
  ]},
  { id: 2, content: 'Can someone explain the difference between = and ==?', created_at: '2025-12-02T14:20:00Z', parent: null, user_name: 'David L.', user_avatar: '', replies: [] },
];
