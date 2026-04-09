from django.db import models
from accounts.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True)
    name_es = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Course(models.Model):
    LEVEL_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    PRICE_TYPE = [('free', 'Free'), ('paid', 'Paid'), ('members', 'Members Only')]

    title = models.CharField(max_length=255)
    title_ar = models.CharField(max_length=255, blank=True)
    title_es = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    description_ar = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    sub_category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_courses')
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='taught_courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE, default='free')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    what_youll_learn = models.JSONField(default=list)
    who_should_take = models.TextField(blank=True)
    who_should_take_ar = models.TextField(blank=True)
    who_should_take_es = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_lectures(self):
        return Lesson.objects.filter(module__course=self).count()

    def total_quizzes(self):
        return Quiz.objects.filter(module__course=self).count()

    def __str__(self):
        return self.title


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    title_ar = models.CharField(max_length=255, blank=True)
    title_es = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    LESSON_TYPE = [('video', 'Video'), ('text', 'Text'), ('exercise', 'Exercise')]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    title_ar = models.CharField(max_length=255, blank=True)
    title_es = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE, default='text')
    video_url = models.URLField(blank=True)
    duration_minutes = models.IntegerField(default=0)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Quiz(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.IntegerField()
    order = models.IntegerField(default=0)


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress = models.FloatField(default=0)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"


class LessonProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['enrollment', 'lesson']
