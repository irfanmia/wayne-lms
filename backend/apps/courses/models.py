import uuid
from django.db import models
from django.conf import settings


class Course(models.Model):
    LEVEL_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    DRIP_TYPE_CHOICES = [('sequential', 'Sequential'), ('scheduled', 'Scheduled'), ('timed', 'Timed')]
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')]

    slug = models.SlugField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    title = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_free = models.BooleanField(default=True)
    thumbnail = models.URLField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    duration = models.PositiveIntegerField(help_text='Duration in minutes', default=0)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    what_youll_learn = models.JSONField(default=list, blank=True)
    who_should_take = models.JSONField(default=dict, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Feature flags
    enable_certificates = models.BooleanField(default=True)
    enable_discussions = models.BooleanField(default=True)
    enable_drip = models.BooleanField(default=False)
    enable_points = models.BooleanField(default=False)
    enable_live_streams = models.BooleanField(default=False)
    enable_group_purchase = models.BooleanField(default=False)
    enable_quizzes = models.BooleanField(default=True)
    enable_prerequisites = models.BooleanField(default=False)
    enable_assignments = models.BooleanField(default=False)
    enable_multi_instructor = models.BooleanField(default=False)

    # Layout & gifting
    layout_template = models.CharField(max_length=20, default='default')
    giftable = models.BooleanField(default=True)
    certificate_enabled = models.BooleanField(default=True)

    # Drip content settings
    drip_enabled = models.BooleanField(default=False)
    drip_type = models.CharField(max_length=20, choices=DRIP_TYPE_CHOICES, default='sequential', blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title.get('en', self.slug) if isinstance(self.title, dict) else self.slug

    def total_lectures(self):
        return Lesson.objects.filter(module__course=self).count()

    def total_quizzes(self):
        return Quiz.objects.filter(course=self).count()


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.slug} - Module {self.order}"


class Lesson(models.Model):
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'), ('text', 'Text'), ('quiz', 'Quiz'),
        ('exercise', 'Exercise'), ('slides', 'Slides'), ('stream', 'Stream'),
        ('assignment', 'Assignment'),
    ]
    VIDEO_SOURCE_CHOICES = [
        ('youtube', 'YouTube'), ('vimeo', 'Vimeo'), ('mp4', 'MP4'),
        ('embed', 'Embed'),
    ]
    STREAM_PLATFORM_CHOICES = [
        ('youtube', 'YouTube'), ('vimeo', 'Vimeo'), ('zoom', 'Zoom'),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.JSONField(default=dict)
    content = models.JSONField(default=dict)
    lesson_type = models.CharField(max_length=10, choices=LESSON_TYPE_CHOICES, default='text')
    video_url = models.URLField(blank=True)
    video_source = models.CharField(max_length=20, choices=VIDEO_SOURCE_CHOICES, blank=True)
    video_duration = models.CharField(max_length=20, blank=True, help_text='e.g. 3m 42s')
    quiz = models.ForeignKey('Quiz', on_delete=models.SET_NULL, null=True, blank=True, related_name='lesson')
    duration = models.PositiveIntegerField(help_text='Duration in minutes', default=0)
    order = models.PositiveIntegerField(default=0)

    # Slides
    slides_data = models.JSONField(default=list, blank=True, help_text='Array of {title, content, image_url}')

    # Stream
    stream_url = models.URLField(blank=True)
    stream_platform = models.CharField(max_length=20, choices=STREAM_PLATFORM_CHOICES, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    is_live = models.BooleanField(default=False)
    recording_url = models.URLField(blank=True)

    # Free preview
    is_free_preview = models.BooleanField(default=False)

    # Drip content
    drip_date = models.DateTimeField(null=True, blank=True)
    drip_days_after_enrollment = models.IntegerField(null=True, blank=True)
    requires_previous = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Lesson {self.order}"


class Quiz(models.Model):
    QUIZ_TYPE_CHOICES = [('module_quiz', 'Module Quiz'), ('assessment', 'Assessment')]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    title = models.JSONField(default=dict)
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='module_quiz')
    questions_count = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)

    # Public/standalone quiz
    is_public = models.BooleanField(default=False)
    standalone_slug = models.SlugField(null=True, blank=True, unique=True)

    # Advanced quiz settings
    time_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Time limit in minutes')
    passing_grade = models.PositiveIntegerField(default=50, help_text='Passing grade percentage')
    max_retakes = models.PositiveIntegerField(null=True, blank=True, help_text='Null = unlimited')
    randomize_questions = models.BooleanField(default=False)
    show_correct_answers = models.BooleanField(default=True)
    points_per_question = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        t = self.title.get('en', '') if isinstance(self.title, dict) else str(self.title)
        return t or f"Quiz {self.id}"


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('single_choice', 'Single Choice'), ('multi_choice', 'Multiple Choice'),
        ('true_false', 'True/False'), ('fill_blank', 'Fill in the Blank'),
        ('keyword_match', 'Keyword Match'), ('image_match', 'Image Match'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='single_choice')
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    correct_text = models.CharField(max_length=500, blank=True, help_text='For fill_blank/keyword_match')
    points = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:80]


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    image_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:80]


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percent = models.FloatField(default=0)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user} - {self.course}"


class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['user', 'lesson']

    def __str__(self):
        return f"{self.user} - Lesson {self.lesson_id}"


class LessonComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_comments')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user} on Lesson {self.lesson_id}"


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user} - {self.course}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user} - Quiz {self.quiz_id} - {self.score}/{self.total_questions}"


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)
    text_answer = models.CharField(max_length=500, blank=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Q{self.question_id} - {'✓' if self.is_correct else '✗'}"


class CoursePrerequisite(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='prerequisite_links')
    required_course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='required_by')

    class Meta:
        unique_together = ['course', 'required_course']

    def __str__(self):
        return f"{self.course} requires {self.required_course}"


# ─── Practice Mode Models ───

class CourseConcept(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='concepts')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    slug = models.SlugField()
    order = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=50, blank=True, null=True)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependents')

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'slug']

    def __str__(self):
        return f"{self.course.slug} - {self.title}"


class CourseExercise(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    LANGUAGE_CHOICES = [('python', 'Python'), ('javascript', 'JavaScript'), ('typescript', 'TypeScript')]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exercises')
    concept = models.ForeignKey(CourseConcept, on_delete=models.CASCADE, related_name='exercises')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    instructions = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    starter_code = models.TextField(blank=True)
    test_code = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='python')
    points = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'slug']

    def __str__(self):
        return f"{self.course.slug} - {self.title}"


class CourseExerciseProgress(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'), ('in_progress', 'In Progress'),
        ('completed', 'Completed'), ('failed', 'Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exercise_progress')
    course_exercise = models.ForeignKey(CourseExercise, on_delete=models.CASCADE, related_name='progress')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='exercise_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    code_submitted = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    points_earned = models.PositiveIntegerField(default=0)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['user', 'course_exercise']

    def __str__(self):
        return f"{self.user} - {self.course_exercise.title} ({self.status})"


class CourseBadge(models.Model):
    CRITERIA_CHOICES = [
        ('first_exercise', 'First Exercise'), ('all_easy', 'All Easy'),
        ('all_medium', 'All Medium'), ('all_hard', 'All Hard'),
        ('all_exercises', 'All Exercises'), ('streak_5', '5 Streak'),
        ('concept_complete', 'Concept Complete'), ('perfect_score', 'Perfect Score'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    icon_url = models.CharField(max_length=500, blank=True)
    criteria_type = models.CharField(max_length=30, choices=CRITERIA_CHOICES)
    criteria_value = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['course', 'slug']

    def __str__(self):
        return f"{self.course.slug} - {self.name}"


class UserCourseBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_badges')
    course_badge = models.ForeignKey(CourseBadge, on_delete=models.CASCADE, related_name='earned_by')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course_badge']

    def __str__(self):
        return f"{self.user} - {self.course_badge.name}"


class DripSchedule(models.Model):
    DRIP_TYPE_CHOICES = [
        ('days_after_enrollment', 'Days After Enrollment'),
        ('specific_date', 'Specific Date'),
        ('after_previous', 'After Previous Module'),
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='drip_schedules')
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    drip_type = models.CharField(max_length=25, choices=DRIP_TYPE_CHOICES)
    days_after = models.IntegerField(default=0)
    specific_date = models.DateField(null=True, blank=True)
    enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.course} - {self.module} drip"


class CourseFAQ(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='faqs')
    question = models.TextField()
    answer = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question[:80]


class CourseNotice(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='notices')
    content = models.TextField()
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notice for {self.course}"


class CourseInstructor(models.Model):
    ROLE_CHOICES = [('primary', 'Primary'), ('co_instructor', 'Co-Instructor')]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_instructors')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teaching_courses')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='co_instructor')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['course', 'instructor']
        ordering = ['order']

    def __str__(self):
        return f"{self.instructor} - {self.course} ({self.role})"
