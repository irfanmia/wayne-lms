export interface PracticeConcept {
  id: number;
  title: string;
  description: string;
  slug: string;
  order: number;
  icon: string | null;
  prerequisite_ids: number[];
  exercises: PracticeExercise[];
  exercise_count: number;
  completed_count: number;
}

export interface PracticeExercise {
  id: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  order: number;
  language: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  points_earned: number;
}

export interface PracticeExerciseDetail extends PracticeExercise {
  description: string;
  instructions: string;
  starter_code: string;
  test_code: string;
  concept: string;
  concept_slug: string;
  code_submitted: string | null;
  attempts: number;
}

export interface ConceptMapNode {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  order: number;
  status: 'completed' | 'in_progress' | 'not_started' | 'locked';
  completed: number;
  total: number;
}

export interface ConceptMapEdge {
  from: number;
  to: number;
}

export interface PracticeBadge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  criteria_type: string;
  earned: boolean;
  earned_at: string | null;
}

export interface PracticeOverview {
  concepts: PracticeConcept[];
  total_exercises: number;
  completed_exercises: number;
  total_points: number;
}

export interface PracticeProgress {
  completed: number;
  total: number;
  points: number;
  badges_earned: number;
  streak: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  output: string;
}

export interface SubmitResult {
  passed: boolean;
  test_results: TestResult[];
  points_earned: number;
  attempts: number;
  status: string;
  new_badges: PracticeBadge[];
}

const mockConcepts: PracticeConcept[] = [
  {
    id: 1, title: 'Variables', description: 'Learn about Python variables, data types, and type conversion.',
    slug: 'variables', order: 1, icon: '📦', prerequisite_ids: [],
    exercise_count: 3, completed_count: 2,
    exercises: [
      { id: 1, title: 'Hello World', slug: 'hello-world', difficulty: 'easy', points: 10, order: 1, language: 'python', status: 'completed', points_earned: 10 },
      { id: 2, title: 'Variable Swap', slug: 'variable-swap', difficulty: 'easy', points: 10, order: 2, language: 'python', status: 'completed', points_earned: 10 },
      { id: 3, title: 'Type Converter', slug: 'type-converter', difficulty: 'easy', points: 10, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
  {
    id: 2, title: 'Control Flow', description: 'Master if/else statements, loops, and conditional logic.',
    slug: 'control-flow', order: 2, icon: '🔀', prerequisite_ids: [1],
    exercise_count: 4, completed_count: 0,
    exercises: [
      { id: 4, title: 'FizzBuzz', slug: 'fizzbuzz', difficulty: 'easy', points: 10, order: 1, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 5, title: 'Grade Calculator', slug: 'grade-calculator', difficulty: 'medium', points: 20, order: 2, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 6, title: 'Leap Year', slug: 'leap-year', difficulty: 'easy', points: 10, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 7, title: 'Number Guesser', slug: 'number-guesser', difficulty: 'medium', points: 20, order: 4, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
  {
    id: 3, title: 'Functions', description: 'Define and use functions, parameters, and return values.',
    slug: 'functions', order: 3, icon: '⚙️', prerequisite_ids: [2],
    exercise_count: 3, completed_count: 0,
    exercises: [
      { id: 8, title: 'Calculator', slug: 'calculator', difficulty: 'medium', points: 20, order: 1, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 9, title: 'Palindrome Checker', slug: 'palindrome-checker', difficulty: 'easy', points: 10, order: 2, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 10, title: 'Fibonacci', slug: 'fibonacci', difficulty: 'medium', points: 20, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
  {
    id: 4, title: 'Data Structures', description: 'Work with lists, dictionaries, sets, and other data structures.',
    slug: 'data-structures', order: 4, icon: '🗂️', prerequisite_ids: [3],
    exercise_count: 4, completed_count: 0,
    exercises: [
      { id: 11, title: 'List Operations', slug: 'list-operations', difficulty: 'easy', points: 10, order: 1, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 12, title: 'Dict Counter', slug: 'dict-counter', difficulty: 'medium', points: 20, order: 2, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 13, title: 'Set Operations', slug: 'set-operations', difficulty: 'easy', points: 10, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 14, title: 'Stack Implementation', slug: 'stack-implementation', difficulty: 'hard', points: 30, order: 4, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
  {
    id: 5, title: 'OOP', description: 'Object-oriented programming with classes and inheritance.',
    slug: 'oop', order: 5, icon: '🏗️', prerequisite_ids: [4],
    exercise_count: 3, completed_count: 0,
    exercises: [
      { id: 15, title: 'Bank Account', slug: 'bank-account', difficulty: 'medium', points: 20, order: 1, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 16, title: 'Shape Calculator', slug: 'shape-calculator', difficulty: 'hard', points: 30, order: 2, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 17, title: 'Student Registry', slug: 'student-registry', difficulty: 'hard', points: 30, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
  {
    id: 6, title: 'File I/O', description: 'Read from and write to files in Python.',
    slug: 'file-io', order: 6, icon: '📁', prerequisite_ids: [1],
    exercise_count: 3, completed_count: 0,
    exercises: [
      { id: 18, title: 'Word Counter', slug: 'word-counter', difficulty: 'medium', points: 20, order: 1, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 19, title: 'CSV Reader', slug: 'csv-reader', difficulty: 'medium', points: 20, order: 2, language: 'python', status: 'not_started', points_earned: 0 },
      { id: 20, title: 'Log Parser', slug: 'log-parser', difficulty: 'hard', points: 30, order: 3, language: 'python', status: 'not_started', points_earned: 0 },
    ],
  },
];

export const mockPracticeOverview: PracticeOverview = {
  concepts: mockConcepts,
  total_exercises: 20,
  completed_exercises: 2,
  total_points: 20,
};

export const mockConceptMap = {
  nodes: [
    { id: 1, title: 'Variables', slug: 'variables', icon: '📦', order: 1, status: 'in_progress' as const, completed: 2, total: 3 },
    { id: 2, title: 'Control Flow', slug: 'control-flow', icon: '🔀', order: 2, status: 'not_started' as const, completed: 0, total: 4 },
    { id: 3, title: 'Functions', slug: 'functions', icon: '⚙️', order: 3, status: 'not_started' as const, completed: 0, total: 3 },
    { id: 4, title: 'Data Structures', slug: 'data-structures', icon: '🗂️', order: 4, status: 'not_started' as const, completed: 0, total: 4 },
    { id: 5, title: 'OOP', slug: 'oop', icon: '🏗️', order: 5, status: 'not_started' as const, completed: 0, total: 3 },
    { id: 6, title: 'File I/O', slug: 'file-io', icon: '📁', order: 6, status: 'not_started' as const, completed: 0, total: 3 },
  ],
  edges: [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 1, to: 6 },
  ],
};

export const mockPracticeProgress: PracticeProgress = {
  completed: 2, total: 20, points: 20, badges_earned: 1, streak: 2,
};

export const mockPracticeBadges: PracticeBadge[] = [
  { id: 1, name: 'First Code', slug: 'first-code', description: 'Complete your first exercise', icon_url: '🎯', criteria_type: 'first_exercise', earned: true, earned_at: '2024-01-15T10:00:00Z' },
  { id: 2, name: 'Easy Peasy', slug: 'easy-peasy', description: 'Complete all easy exercises', icon_url: '🌟', criteria_type: 'all_easy', earned: false, earned_at: null },
  { id: 3, name: 'Challenge Accepted', slug: 'challenge-accepted', description: 'Complete all medium exercises', icon_url: '🔥', criteria_type: 'all_medium', earned: false, earned_at: null },
  { id: 4, name: 'Hardcore', slug: 'hardcore', description: 'Complete all hard exercises', icon_url: '💎', criteria_type: 'all_hard', earned: false, earned_at: null },
  { id: 5, name: 'Python Ninja', slug: 'python-ninja', description: 'Complete all exercises', icon_url: '🥷', criteria_type: 'all_exercises', earned: false, earned_at: null },
  { id: 6, name: 'Streak Master', slug: 'streak-master', description: 'Complete 5 exercises in a row', icon_url: '⚡', criteria_type: 'streak_5', earned: false, earned_at: null },
  { id: 7, name: 'Concept Clear', slug: 'concept-clear', description: 'Complete all exercises in a concept', icon_url: '🧠', criteria_type: 'concept_complete', earned: false, earned_at: null },
  { id: 8, name: 'Perfect Run', slug: 'perfect-run', description: 'Complete all exercises on first attempt', icon_url: '💯', criteria_type: 'perfect_score', earned: false, earned_at: null },
];

export const mockExerciseDetails: Record<string, PracticeExerciseDetail> = {
  'hello-world': {
    id: 1, title: 'Hello World', slug: 'hello-world', difficulty: 'easy', points: 10, order: 1,
    language: 'python', status: 'completed', points_earned: 10,
    description: 'Write your first Python program.',
    instructions: 'Create a function called `hello()` that returns the string "Hello, World!".',
    starter_code: 'def hello():\n    # Your code here\n    pass',
    test_code: 'result = hello()\nif result == "Hello, World!":\n    print("PASS: hello() returns correct string")\nelse:\n    print(f"FAIL: Expected \'Hello, World!\' but got \'{result}\'")',
    concept: 'Variables', concept_slug: 'variables',
    code_submitted: 'def hello():\n    return "Hello, World!"', attempts: 1,
  },
  'variable-swap': {
    id: 2, title: 'Variable Swap', slug: 'variable-swap', difficulty: 'easy', points: 10, order: 2,
    language: 'python', status: 'completed', points_earned: 10,
    description: 'Swap two variables without a temp variable.',
    instructions: 'Create a function `swap(a, b)` that returns a tuple with the values swapped.',
    starter_code: 'def swap(a, b):\n    # Your code here\n    pass',
    test_code: '',
    concept: 'Variables', concept_slug: 'variables',
    code_submitted: 'def swap(a, b):\n    return (b, a)', attempts: 1,
  },
  'fizzbuzz': {
    id: 4, title: 'FizzBuzz', slug: 'fizzbuzz', difficulty: 'easy', points: 10, order: 1,
    language: 'python', status: 'not_started', points_earned: 0,
    description: 'The classic FizzBuzz problem.',
    instructions: 'Create `fizzbuzz(n)` that returns "Fizz" if n is divisible by 3, "Buzz" if by 5, "FizzBuzz" if by both, otherwise the number as a string.',
    starter_code: 'def fizzbuzz(n):\n    # Your code here\n    pass',
    test_code: '',
    concept: 'Control Flow', concept_slug: 'control-flow',
    code_submitted: null, attempts: 0,
  },
};
