from rest_framework import serializers
from .models import (Category, Course, Module, Lesson, Quiz, Question, Choice,
                     QuizAttempt, QuizAnswer, LessonProgress, LessonComment,
                     Wishlist, Enrollment, CoursePrerequisite, CourseInstructor,
                     DripSchedule, CourseFAQ, CourseNotice)


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']


class ChoiceWithAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'explanation', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'quiz_type', 'questions_count', 'order', 'questions']


class QuizListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'quiz_type', 'questions_count', 'order']


class LessonSerializer(serializers.ModelSerializer):
    quiz_id = serializers.PrimaryKeyRelatedField(source='quiz', read_only=True)
    assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'lesson_type', 'video_url', 'video_source',
                  'video_duration', 'audio_url', 'quiz_id', 'assignment_id', 'duration', 'order', 'is_free_preview']

    def get_assignment_id(self, obj):
        assignment = obj.assignments.first()
        return assignment.id if assignment else None


class LessonBriefSerializer(serializers.ModelSerializer):
    quiz_id = serializers.PrimaryKeyRelatedField(source='quiz', read_only=True)
    assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'lesson_type', 'video_duration', 'quiz_id', 'assignment_id', 'duration', 'order', 'is_free_preview']

    def get_assignment_id(self, obj):
        assignment = obj.assignments.first()
        return assignment.id if assignment else None


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonBriefSerializer(many=True, read_only=True)
    quizzes = QuizListSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons', 'quizzes']


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses. Auto-generates slug from title if missing."""
    class Meta:
        model = Course
        fields = ['slug', 'title', 'description', 'category', 'level', 'price',
                  'is_free', 'thumbnail', 'duration', 'is_featured', 'status',
                  'course_type', 'industry_meta',
                  'enable_certificates', 'enable_discussions', 'enable_drip',
                  'enable_points', 'enable_quizzes', 'enable_prerequisites',
                  'enable_assignments', 'enable_practice', 'enable_multi_instructor',
                  'what_youll_learn', 'who_should_take', 'layout_template']
        extra_kwargs = {
            'slug': {'required': False},
            'description': {'required': False},
        }


    def _resolve_category(self, validated_data):
        request = self.context.get("request")
        if request:
            cat_id = request.data.get("category_id")
            sub_cat_id = request.data.get("sub_category_id")
            if cat_id:
                try:
                    cat = Category.objects.get(id=int(cat_id))
                    validated_data["category_fk"] = cat
                    validated_data["category"] = cat.name
                except Exception:
                    pass
            if sub_cat_id:
                try:
                    validated_data["sub_category_fk"] = Category.objects.get(id=int(sub_cat_id))
                except Exception:
                    pass
            elif "sub_category_id" in request.data:
                validated_data["sub_category_fk"] = None

    def create(self, validated_data):
        self._resolve_category(validated_data)
        # Auto-generate slug from title if not provided
        if 'slug' not in validated_data or not validated_data['slug']:
            import re
            title = validated_data.get('title', {})
            name = title.get('en', '') if isinstance(title, dict) else str(title)
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            # Ensure uniqueness
            base_slug = slug
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            validated_data['slug'] = slug
        # Default status to draft
        validated_data.setdefault('status', 'draft')
        # Default description
        if 'description' not in validated_data or not validated_data['description']:
            validated_data['description'] = validated_data.get('title', {})
        return super().create(validated_data)


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight course representation for list/catalog views."""
    module_count = serializers.IntegerField(source='modules.count', read_only=True)
    instructor = serializers.SerializerMethodField()
    priceType = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'slug', 'title', 'description', 'is_free', 'price', 'thumbnail',
                  'category', 'category_fk', 'sub_category_fk', 'duration', 'level', 'module_count', 'instructor', 'priceType',
                  'status', 'course_type', 'created_at')

    def get_instructor(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name() or obj.instructor.username
        return 'Wayne LMS'

    def get_priceType(self, obj):
        return 'free' if obj.is_free else ('paid' if obj.price > 0 else 'members')


class CourseFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFAQ
        fields = '__all__'


class CourseNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseNotice
        fields = '__all__'


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full course details including modules, curriculum, prerequisites, and instructors."""
    modules = ModuleSerializer(many=True, read_only=True)
    faqs = CourseFAQSerializer(many=True, read_only=True)
    notices = CourseNoticeSerializer(many=True, read_only=True)
    instructor = serializers.SerializerMethodField()
    priceType = serializers.SerializerMethodField()
    curriculum = serializers.SerializerMethodField()
    course_prerequisites = serializers.SerializerMethodField()
    course_instructors = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_instructor(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name() or obj.instructor.username
        return 'Wayne LMS'

    def get_priceType(self, obj):
        return 'free' if obj.is_free else ('paid' if obj.price > 0 else 'members')

    def get_curriculum(self, obj):
        result = []
        for module in obj.modules.all().prefetch_related('lessons', 'quizzes'):
            mod_data = {
                'title': module.title,
                'lessons': [
                    {
                        'id': lesson.id,
                        'title': lesson.title,
                        'type': lesson.lesson_type,
                        'duration': lesson.video_duration or f'{lesson.duration} min',
                        'quiz_id': lesson.quiz_id,
                        'is_free_preview': lesson.is_free_preview,
                    }
                    for lesson in module.lessons.all()
                ],
            }
            quizzes = module.quizzes.all()
            if quizzes.exists():
                q = quizzes.first()
                mod_data['quiz'] = {
                    'id': q.id,
                    'title': q.title,
                    'questions': q.questions_count,
                }
            result.append(mod_data)
        return result

    def get_course_prerequisites(self, obj):
        prereqs = CoursePrerequisite.objects.filter(course=obj).select_related('required_course')
        return [{
            'slug': p.required_course.slug,
            'title': p.required_course.title.get('en', p.required_course.slug) if isinstance(p.required_course.title, dict) else str(p.required_course.title),
        } for p in prereqs]

    def get_course_instructors(self, obj):
        instructors = CourseInstructor.objects.filter(course=obj).select_related('instructor')
        result = []
        if obj.instructor:
            result.append({
                'id': obj.instructor.id,
                'name': obj.instructor.get_full_name() or obj.instructor.username,
                'avatar': getattr(obj.instructor, 'avatar', ''),
                'bio': getattr(obj.instructor, 'bio', ''),
                'role': 'primary',
            })
        for ci in instructors:
            if obj.instructor and ci.instructor_id == obj.instructor.id:
                continue
            result.append({
                'id': ci.instructor.id,
                'name': ci.instructor.get_full_name() or ci.instructor.username,
                'avatar': getattr(ci.instructor, 'avatar', ''),
                'bio': getattr(ci.instructor, 'bio', ''),
                'role': ci.role,
            })
        return result

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['categorySlug'] = instance.category
        ret['lectures'] = Lesson.objects.filter(module__course=instance).count()
        ret['quizzes'] = instance.total_quizzes()
        return ret


class CourseLearnSerializer(serializers.ModelSerializer):
    """Full course data for the learning view with progress."""
    modules = serializers.SerializerMethodField()
    instructor = serializers.SerializerMethodField()
    assessment = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'slug', 'title', 'description', 'thumbnail', 'level',
                  'instructor', 'modules', 'assessment', 'progress']

    def get_instructor(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name() or obj.instructor.username
        return 'Wayne LMS'

    def get_modules(self, obj):
        modules = []
        for module in obj.modules.all().prefetch_related('lessons__quiz', 'quizzes'):
            lessons = []
            for lesson in module.lessons.all():
                assignment = lesson.assignments.first()
                lessons.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'lesson_type': lesson.lesson_type,
                    'duration': lesson.video_duration or f'{lesson.duration} min',
                    'video_url': lesson.video_url,
                    'quiz_id': lesson.quiz_id,
                    'assignment_id': assignment.id if assignment else None,
                    'order': lesson.order,
                })
            quiz = module.quizzes.first()
            modules.append({
                'id': module.id,
                'title': module.title,
                'order': module.order,
                'lessons': lessons,
                'quiz': {
                    'id': quiz.id,
                    'title': quiz.title,
                    'questions_count': quiz.questions_count,
                } if quiz else None,
            })
        return modules

    def get_assessment(self, obj):
        assessment = obj.quizzes.filter(quiz_type='assessment').first()
        if assessment:
            return {
                'id': assessment.id,
                'title': assessment.title,
                'questions_count': assessment.questions_count,
            }
        return None

    def get_progress(self, obj):
        user = self.context.get('request', {})
        if hasattr(user, 'user') and user.user.is_authenticated:
            completed_ids = list(
                LessonProgress.objects.filter(
                    user=user.user,
                    lesson__module__course=obj,
                    completed=True
                ).values_list('lesson_id', flat=True)
            )
            total = Lesson.objects.filter(module__course=obj).count()
            return {
                'completed_lessons': completed_ids,
                'total_lessons': total,
                'percent': round(len(completed_ids) / total * 100) if total > 0 else 0,
            }
        return {'completed_lessons': [], 'total_lessons': 0, 'percent': 0}


class LessonCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = LessonComment
        fields = ['id', 'content', 'created_at', 'parent', 'user_name', 'user_avatar', 'replies']
        read_only_fields = ['created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_user_avatar(self, obj):
        return getattr(obj.user, 'avatar', '') or ''

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()
            return LessonCommentSerializer(replies, many=True).data
        return []


class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.IntegerField(), help_text='{"question_id": choice_id}')


class QuizResultSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = ['id', 'score', 'total_questions', 'passed', 'started_at', 'completed_at', 'answers']

    def get_answers(self, obj):
        return [
            {
                'question_id': a.question_id,
                'selected_choice_id': a.selected_choice_id,
                'is_correct': a.is_correct,
            }
            for a in obj.answers.all()
        ]


class WishlistSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'course', 'added_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at', 'progress_percent']


class DripScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DripSchedule
        fields = '__all__'


# CourseFAQSerializer and CourseNoticeSerializer moved above CourseDetailSerializer


# ─── Category Serializer ───

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        try:
            if obj.parent is not None:
                return []
            return CategorySerializer(obj.subcategories.all(), many=True).data
        except Exception:
            return []
