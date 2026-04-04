from rest_framework import serializers
from .models import Category, Course, Module, Lesson, Quiz, QuizQuestion, Enrollment, LessonProgress
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = '__all__'


class CourseListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructor = UserSerializer(read_only=True)
    total_lectures = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'thumbnail', 'category',
                  'instructor', 'level', 'price_type', 'price', 'is_featured',
                  'total_lectures', 'created_at']

    def get_total_lectures(self, obj):
        return obj.total_lectures()


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructor = UserSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    total_lectures = serializers.SerializerMethodField()
    total_quizzes = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_total_lectures(self, obj):
        return obj.total_lectures()

    def get_total_quizzes(self, obj):
        return obj.total_quizzes()


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['user', 'enrolled_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = '__all__'
