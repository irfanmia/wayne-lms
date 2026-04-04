// Mock data for Course Builder

export type LessonType = 'text' | 'video' | 'audio' | 'slides' | 'stream' | 'quiz' | 'assignment' | 'exercise';

export interface LessonItem {
  id: string;
  type: LessonType;
  title: string;
  duration?: string;
  isPreview?: boolean;
  isDrip?: boolean;
}

export interface Section {
  id: string;
  title: string;
  isExpanded: boolean;
  items: LessonItem[];
}

export interface QuizQuestion {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false' | 'matching' | 'fill-in-the-gap' | 'keywords';
  title: string;
  answers: { id: string; text: string; isCorrect: boolean }[];
  isExpanded: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ExerciseItem {
  id: string;
  title: string;
  track: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface CourseBuilderData {
  slug: string;
  title: string;
  status: 'published' | 'draft' | 'pending';
  category: string;
  level: string;
  instructor: string;
  image: string;
  description: string;
  sections: Section[];
  quizQuestions: QuizQuestion[];
  faq: FAQItem[];
  exercises: ExerciseItem[];
  pricing: { type: 'free' | 'paid' | 'members'; price: number; salePrice: number; certificateIncluded: boolean };
  notice: string;
  settings: {
    access: string;
    prerequisites: string[];
    courseFiles: string[];
    certificate: boolean;
    template: string;
  };
}

export const lessonTypeConfig: Record<LessonType, { icon: string; label: string; color: string }> = {
  text: { icon: '📄', label: 'Text Lesson', color: 'bg-blue-100 text-blue-700' },
  video: { icon: '🎥', label: 'Video Lesson', color: 'bg-purple-100 text-purple-700' },
  audio: { icon: '🎧', label: 'Audio Lesson', color: 'bg-green-100 text-green-700' },
  slides: { icon: '📊', label: 'Slides Lesson', color: 'bg-yellow-100 text-yellow-700' },
  stream: { icon: '📡', label: 'Stream Lesson', color: 'bg-red-100 text-red-700' },
  quiz: { icon: '❓', label: 'Quiz', color: 'bg-orange-100 text-orange-700' },
  assignment: { icon: '📋', label: 'Assignment', color: 'bg-indigo-100 text-indigo-700' },
  exercise: { icon: '💻', label: 'Exercise', color: 'bg-emerald-100 text-emerald-700' },
};

export const quizTypeConfig: Record<string, { label: string; color: string }> = {
  'single-choice': { label: 'SINGLE CHOICE', color: 'bg-blue-100 text-blue-700' },
  'multiple-choice': { label: 'MULTIPLE CHOICE', color: 'bg-purple-100 text-purple-700' },
  'true-false': { label: 'TRUE-FALSE', color: 'bg-green-100 text-green-700' },
  'matching': { label: 'MATCHING', color: 'bg-yellow-100 text-yellow-700' },
  'fill-in-the-gap': { label: 'FILL IN THE GAP', color: 'bg-red-100 text-red-700' },
  'keywords': { label: 'KEYWORDS', color: 'bg-indigo-100 text-indigo-700' },
};

export const mockCourse: CourseBuilderData = {
  slug: 'introduction-to-python',
  title: 'Introduction to Python Programming',
  status: 'published',
  category: 'Web Development',
  level: 'Beginner',
  instructor: 'Dr. Sarah Ahmed',
  image: '/images/courses/python.jpg',
  description: 'Learn Python from scratch with hands-on projects and exercises. This comprehensive course covers fundamentals, data structures, OOP, and real-world applications.',
  sections: [
    {
      id: 'sec-1',
      title: 'Getting Started with Python',
      isExpanded: true,
      items: [
        { id: 'item-1', type: 'text', title: 'Welcome to the Course', duration: '5 min', isPreview: true },
        { id: 'item-2', type: 'video', title: 'Installing Python & IDE Setup', duration: '12 min' },
        { id: 'item-3', type: 'text', title: 'Your First Python Script', duration: '8 min' },
        { id: 'item-4', type: 'quiz', title: 'Python Basics Quiz' },
      ],
    },
    {
      id: 'sec-2',
      title: 'Variables & Data Types',
      isExpanded: true,
      items: [
        { id: 'item-5', type: 'video', title: 'Understanding Variables', duration: '15 min' },
        { id: 'item-6', type: 'text', title: 'Strings, Numbers & Booleans', duration: '10 min' },
        { id: 'item-7', type: 'slides', title: 'Data Types Cheatsheet', duration: '5 min' },
        { id: 'item-8', type: 'assignment', title: 'Variable Practice Assignment' },
      ],
    },
    {
      id: 'sec-3',
      title: 'Control Flow & Loops',
      isExpanded: false,
      items: [
        { id: 'item-9', type: 'video', title: 'If/Else Statements', duration: '18 min' },
        { id: 'item-10', type: 'video', title: 'For & While Loops', duration: '20 min' },
        { id: 'item-11', type: 'audio', title: 'Loop Patterns Discussion', duration: '12 min' },
        { id: 'item-12', type: 'quiz', title: 'Control Flow Quiz' },
        { id: 'item-13', type: 'stream', title: 'Live Coding Session: Loops', duration: '45 min' },
      ],
    },
  ],
  quizQuestions: [
    {
      id: 'q-1', type: 'single-choice', title: 'What is the correct file extension for Python files?', isExpanded: true,
      answers: [
        { id: 'a-1', text: '.python', isCorrect: false },
        { id: 'a-2', text: '.py', isCorrect: true },
        { id: 'a-3', text: '.pt', isCorrect: false },
        { id: 'a-4', text: '.pyt', isCorrect: false },
      ],
    },
    {
      id: 'q-2', type: 'true-false', title: 'Python is a compiled language.', isExpanded: false,
      answers: [
        { id: 'a-5', text: 'True', isCorrect: false },
        { id: 'a-6', text: 'False', isCorrect: true },
      ],
    },
    {
      id: 'q-3', type: 'multiple-choice', title: 'Which of the following are valid Python data types?', isExpanded: false,
      answers: [
        { id: 'a-7', text: 'int', isCorrect: true },
        { id: 'a-8', text: 'str', isCorrect: true },
        { id: 'a-9', text: 'char', isCorrect: false },
        { id: 'a-10', text: 'list', isCorrect: true },
      ],
    },
    {
      id: 'q-4', type: 'fill-in-the-gap', title: 'The function used to print output in Python is _____.', isExpanded: false,
      answers: [{ id: 'a-11', text: 'print', isCorrect: true }],
    },
  ],
  faq: [
    { id: 'faq-1', question: 'Do I need prior programming experience?', answer: 'No! This course is designed for absolute beginners.' },
    { id: 'faq-2', question: 'What IDE should I use?', answer: 'We recommend VS Code or PyCharm Community Edition.' },
    { id: 'faq-3', question: 'How long do I have access?', answer: 'You have lifetime access once enrolled.' },
  ],
  exercises: [
    { id: 'ex-1', title: 'Hello World', track: 'Python', concept: 'Basics', difficulty: 'easy', points: 10 },
    { id: 'ex-2', title: 'FizzBuzz', track: 'Python', concept: 'Loops', difficulty: 'easy', points: 20 },
    { id: 'ex-3', title: 'Palindrome Checker', track: 'Python', concept: 'Strings', difficulty: 'medium', points: 30 },
  ],
  pricing: { type: 'paid', price: 49.99, salePrice: 29.99, certificateIncluded: true },
  notice: '<h2>Welcome to the updated Python course!</h2><p>We have added 5 new lessons on advanced topics. Check out Section 3 for the latest content.</p>',
  settings: {
    access: 'open',
    prerequisites: ['introduction-to-programming'],
    courseFiles: ['python-cheatsheet.pdf', 'starter-code.zip'],
    certificate: true,
    template: 'default',
  },
};

export const allMaterials: { id: string; type: LessonType; title: string; course: string }[] = [
  { id: 'm-1', type: 'video', title: 'Introduction to HTML', course: 'Web Development Basics' },
  { id: 'm-2', type: 'text', title: 'CSS Box Model Explained', course: 'Web Development Basics' },
  { id: 'm-3', type: 'quiz', title: 'JavaScript Fundamentals Quiz', course: 'JavaScript Mastery' },
  { id: 'm-4', type: 'video', title: 'React Components Deep Dive', course: 'React for Beginners' },
  { id: 'm-5', type: 'assignment', title: 'Build a REST API', course: 'Node.js Backend' },
  { id: 'm-6', type: 'text', title: 'Understanding Databases', course: 'Database Design' },
  { id: 'm-7', type: 'video', title: 'Git Branching Strategies', course: 'Git & GitHub' },
  { id: 'm-8', type: 'slides', title: 'Agile Methodology Overview', course: 'Project Management' },
  { id: 'm-9', type: 'audio', title: 'Interview with Senior Dev', course: 'Career in Tech' },
  { id: 'm-10', type: 'quiz', title: 'Python OOP Quiz', course: 'Advanced Python' },
];
