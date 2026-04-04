// Mock assignment data for offline/demo mode

export interface MockAssignment {
  id: number;
  title: string;
  description: string;
  submission_type: string;
  answer_type: string;
  points: number;
  due_date: string;
  programming_language: string;
  starter_code: string;
  test_code: string;
  rubric: string;
  max_attempts: number;
  auto_grade: boolean;
  allowed_extensions: string;
  max_file_size: number;
}

export const mockAssignments: Record<number, MockAssignment> = {
  1: {
    id: 1,
    title: 'Build a Student Management System',
    description: `## Student Management System

Create a Python program that manages student records using Object-Oriented Programming.

### Requirements

1. **Student class** with attributes: \`name\`, \`student_id\`, \`grades\` (list)
2. **Methods:**
   - \`add_grade(grade)\` — add a grade (0-100)
   - \`get_average()\` — return average grade
   - \`get_letter_grade()\` — return letter grade (A/B/C/D/F)
   - \`__str__()\` — formatted string representation
3. **StudentManager class** with:
   - \`add_student(student)\`
   - \`remove_student(student_id)\`
   - \`get_student(student_id)\`
   - \`get_top_students(n)\` — top N students by average
   - \`get_class_average()\`

### Example Usage
\`\`\`python
manager = StudentManager()
s1 = Student("Alice", "S001")
s1.add_grade(95)
s1.add_grade(87)
manager.add_student(s1)
print(manager.get_class_average())
\`\`\``,
    submission_type: 'code',
    answer_type: 'code',
    points: 100,
    due_date: '2026-03-15',
    programming_language: 'python',
    starter_code: '',
    test_code: `import pytest

def test_student_add_grade():
    s = Student("Alice", "S001")
    s.add_grade(95)
    s.add_grade(85)
    assert len(s.grades) == 2

def test_student_average():
    s = Student("Bob", "S002")
    s.add_grade(90)
    s.add_grade(80)
    assert s.get_average() == 85.0

def test_student_letter_grade():
    s = Student("Carol", "S003")
    s.add_grade(92)
    assert s.get_letter_grade() == "A"

def test_manager_add_get():
    m = StudentManager()
    s = Student("Dave", "S004")
    m.add_student(s)
    assert m.get_student("S004").name == "Dave"

def test_manager_top_students():
    m = StudentManager()
    s1 = Student("A", "1"); s1.add_grade(95)
    s2 = Student("B", "2"); s2.add_grade(80)
    s3 = Student("C", "3"); s3.add_grade(90)
    m.add_student(s1); m.add_student(s2); m.add_student(s3)
    top = m.get_top_students(2)
    assert len(top) == 2
    assert top[0].name == "A"
`,
    rubric: `### Grading Rubric (100 points)

| Criteria | Points |
|----------|--------|
| Student class implementation | 25 |
| Grade methods (add, average, letter) | 25 |
| StudentManager CRUD operations | 25 |
| Top students & class average | 15 |
| Code quality & style | 10 |`,
    max_attempts: 3,
    auto_grade: true,
    allowed_extensions: '.py',
    max_file_size: 1048576,
  },
  2: {
    id: 2,
    title: 'Build a Calculator',
    description: `## Python Calculator

Build a command-line calculator that supports basic arithmetic operations.

### Requirements

1. Support operations: \`+\`, \`-\`, \`*\`, \`/\`, \`**\` (power), \`%\` (modulo)
2. Handle division by zero gracefully
3. Support chaining operations (e.g., \`2 + 3 * 4\`)
4. Include a \`calculate(expression: str) -> float\` function
5. Add input validation

### Bonus
- Support parentheses
- Add memory functions (M+, M-, MR, MC)`,
    submission_type: 'code',
    answer_type: 'code',
    points: 50,
    due_date: '2026-03-10',
    programming_language: 'python',
    starter_code: '',
    test_code: `import pytest

def test_addition():
    assert calculate("2 + 3") == 5.0

def test_subtraction():
    assert calculate("10 - 4") == 6.0

def test_multiplication():
    assert calculate("3 * 7") == 21.0

def test_division():
    assert calculate("15 / 3") == 5.0

def test_power():
    assert calculate("2 ** 3") == 8.0

def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        calculate("5 / 0")
`,
    rubric: `### Grading Rubric (50 points)

| Criteria | Points |
|----------|--------|
| Basic operations (+, -, *, /) | 15 |
| Power & modulo | 10 |
| Error handling | 10 |
| Input validation | 10 |
| Code quality | 5 |`,
    max_attempts: 5,
    auto_grade: true,
    allowed_extensions: '.py',
    max_file_size: 1048576,
  },
  3: {
    id: 3,
    title: 'Control Flow Best Practices',
    description: `## Essay: Control Flow Best Practices

Write an essay (500-1000 words) discussing best practices for using control flow structures in Python.

### Topics to Cover

1. When to use \`if/elif/else\` vs \`match/case\` (Python 3.10+)
2. Best practices for loop design — avoiding infinite loops, choosing \`for\` vs \`while\`
3. The role of \`break\`, \`continue\`, and \`else\` clauses in loops
4. How to write readable conditional logic — guard clauses, early returns
5. Real-world examples from your own experience or projects

Include code snippets where helpful to illustrate your points.`,
    submission_type: 'text',
    answer_type: 'essay',
    points: 30,
    due_date: '2026-03-12',
    programming_language: '',
    starter_code: '',
    test_code: '',
    rubric: `### Grading Rubric (30 points)

| Criteria | Points |
|----------|--------|
| Coverage of all 5 topics | 10 |
| Clarity and organization | 8 |
| Code examples quality | 7 |
| Writing quality & grammar | 5 |`,
    max_attempts: 2,
    auto_grade: false,
    allowed_extensions: '',
    max_file_size: 0,
  },
  4: {
    id: 4,
    title: 'OOP Class Diagram',
    description: `## Upload: OOP Class Diagram

Create a UML class diagram for the Student Management System you built in the previous assignment.

### Requirements

1. Include all classes (Student, StudentManager, and any additional classes you created)
2. Show attributes with types and visibility (+, -, #)
3. Show methods with parameters and return types
4. Include relationships (inheritance, composition, association)
5. Use proper UML notation

### Accepted Formats
Upload as PDF, PNG, or JPG. You can use tools like draw.io, Lucidchart, or even hand-drawn (take a clear photo).`,
    submission_type: 'file_upload',
    answer_type: 'document',
    points: 20,
    due_date: '2026-03-18',
    programming_language: '',
    starter_code: '',
    test_code: '',
    rubric: `### Grading Rubric (20 points)

| Criteria | Points |
|----------|--------|
| All classes included | 5 |
| Attributes with types | 5 |
| Methods with signatures | 5 |
| Relationships shown correctly | 3 |
| Neatness and readability | 2 |`,
    max_attempts: 3,
    auto_grade: false,
    allowed_extensions: '.pdf,.png,.jpg,.jpeg',
    max_file_size: 10485760,
  },
  5: {
    id: 5,
    title: 'Portfolio Project URL',
    description: `## Submit: Portfolio Project

Submit the URL to your Python portfolio project hosted on GitHub.

### Requirements

1. Repository must be **public** on GitHub
2. Include a comprehensive README.md with:
   - Project description
   - Installation instructions
   - Usage examples
   - Screenshots (if applicable)
3. Code must be well-organized with proper file structure
4. Include at least 5 meaningful commits showing your development process
5. Bonus: Deploy to a live URL (Heroku, Render, Vercel, etc.)`,
    submission_type: 'url',
    answer_type: 'project_url',
    points: 25,
    due_date: '2026-03-20',
    programming_language: '',
    starter_code: '',
    test_code: '',
    rubric: `### Grading Rubric (25 points)

| Criteria | Points |
|----------|--------|
| Working GitHub repository | 5 |
| README quality | 5 |
| Code organization | 5 |
| Commit history | 5 |
| Bonus: Live deployment | 5 |`,
    max_attempts: 2,
    auto_grade: false,
    allowed_extensions: '',
    max_file_size: 0,
  },
  6: {
    id: 6,
    title: 'Final Project: Complete Python App',
    description: `## Final Project: Complete Python Application

Build and submit a complete Python application that demonstrates everything you've learned in this course.

### Requirements

1. Use OOP with at least 3 classes
2. Implement proper error handling
3. Include unit tests (minimum 10 test cases)
4. Write clean, documented code with docstrings

### Submission

This assignment requires **two parts**:

1. 📝 **Written report** — Explain your design decisions, architecture, and challenges faced (300+ words)
2. 💻 **Source code** — Your complete Python application`,
    submission_type: 'mixed',
    answer_type: 'mixed',
    points: 150,
    due_date: '2026-03-25',
    programming_language: 'python',
    starter_code: '',
    test_code: '',
    rubric: `### Grading Rubric (150 points)

| Criteria | Points |
|----------|--------|
| OOP design (3+ classes) | 30 |
| Core functionality | 30 |
| Error handling | 20 |
| Unit tests (10+ cases) | 25 |
| Code documentation | 15 |
| Written report quality | 15 |
| GitHub repo & README | 10 |
| Code style & organization | 5 |`,
    max_attempts: 3,
    auto_grade: false,
    allowed_extensions: '',
    max_file_size: 0,
  },
};
