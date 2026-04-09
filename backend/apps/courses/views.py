from django.utils import timezone
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (Category, Course, Module, Lesson, Quiz, Question, Choice, QuizAttempt,
                     QuizAnswer, LessonProgress, LessonComment, Wishlist, Enrollment,
                     CoursePrerequisite, CourseInstructor)
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseLearnSerializer,
    CourseCreateUpdateSerializer,
    LessonSerializer, QuizSerializer, QuestionWithAnswerSerializer,
    QuizSubmitSerializer, QuizResultSerializer, LessonCommentSerializer,
    WishlistSerializer, EnrollmentSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for courses. Public users see published courses only; staff see all."""
    lookup_field = 'slug'

    def get_queryset(self):
        # Admin/staff see all courses; public only sees published
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(status='published')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CourseCreateUpdateSerializer
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['get'], url_path='learn')
    def learn(self, request, slug=None):
        course = self.get_object()
        serializer = CourseLearnSerializer(course, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, slug=None):
        course = self.get_object()
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        # Check prerequisites
        prereqs = CoursePrerequisite.objects.filter(course=course)
        if prereqs.exists():
            completed_courses = Enrollment.objects.filter(
                user=request.user, completed_at__isnull=False
            ).values_list('course_id', flat=True)
            missing = prereqs.exclude(required_course_id__in=completed_courses)
            if missing.exists():
                missing_titles = [
                    p.required_course.title.get('en', p.required_course.slug) if isinstance(p.required_course.title, dict) else str(p.required_course.title)
                    for p in missing
                ]
                return Response({
                    'detail': 'Prerequisites not met',
                    'missing_prerequisites': missing_titles,
                }, status=status.HTTP_400_BAD_REQUEST)

        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if not created:
            return Response({'detail': 'Already enrolled', 'enrolled': True})
        return Response({'detail': 'Enrolled successfully', 'enrolled': True}, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=["get"], url_path="enrolled")
    def enrolled(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        enrolled_course_ids = Enrollment.objects.filter(user=request.user).values_list("course_id", flat=True)
        courses = Course.objects.filter(id__in=enrolled_course_ids, status="published")
        serializer = CourseListSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my-courses")
    def my_courses(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        enrolled_course_ids = Enrollment.objects.filter(user=request.user).values_list("course_id", flat=True)
        courses = Course.objects.filter(id__in=enrolled_course_ids, status="published")
        serializer = CourseListSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)
    @action(detail=True, methods=['get', 'put'], url_path='prerequisites')
    def prerequisites(self, request, slug=None):
        course = self.get_object()
        prereqs = CoursePrerequisite.objects.filter(course=course).select_related('required_course')
        data = []
        for p in prereqs:
            rc = p.required_course
            t = rc.title
            completed = False
            if request.user.is_authenticated:
                completed = Enrollment.objects.filter(
                    user=request.user, course=rc, completed_at__isnull=False
                ).exists()
            data.append({
                'slug': rc.slug,
                'title': t.get('en', rc.slug) if isinstance(t, dict) else str(t),
                'completed': completed,
            })
        # Handle PUT to update prerequisites
        if request.method == 'PUT':
            if not request.user.is_staff:
                return Response({'detail': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
            slugs = request.data.get('prerequisite_slugs', [])
            CoursePrerequisite.objects.filter(course=course).delete()
            for req_slug in slugs:
                try:
                    req_course = Course.objects.get(slug=req_slug)
                    CoursePrerequisite.objects.create(course=course, required_course=req_course)
                except Course.DoesNotExist:
                    pass
            return Response({'detail': f'Prerequisites updated ({len(slugs)} courses)'})

        return Response(data)


class LessonViewSet(viewsets.GenericViewSet):
    """Retrieve individual lessons and mark them complete. Supports free preview access."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def retrieve(self, request, pk=None):
        lesson = self.get_object()
        # Allow free preview lessons without auth
        if not lesson.is_free_preview and not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        data = LessonSerializer(lesson).data
        data['is_free_preview'] = lesson.is_free_preview
        return Response(data)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        lesson = self.get_object()
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        lp, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        lp.completed = True
        lp.completed_at = timezone.now()
        lp.save()
        # Update enrollment progress
        course = lesson.module.course
        total = Lesson.objects.filter(module__course=course).count()
        completed = LessonProgress.objects.filter(
            user=request.user, lesson__module__course=course, completed=True
        ).count()
        pct = round(completed / total * 100) if total > 0 else 0
        Enrollment.objects.filter(user=request.user, course=course).update(progress_percent=pct)
        return Response({'completed': True, 'progress_percent': pct})

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        lesson = self.get_object()
        if request.method == 'GET':
            comments = lesson.comments.filter(parent=None)
            return Response(LessonCommentSerializer(comments, many=True).data)
        # POST
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'detail': 'Content required'}, status=status.HTTP_400_BAD_REQUEST)
        parent_id = request.data.get('parent')
        comment = LessonComment.objects.create(
            user=request.user, lesson=lesson, content=content,
            parent_id=parent_id
        )
        return Response(LessonCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class QuizViewSet(viewsets.GenericViewSet):
    """Retrieve quizzes, submit answers, and view attempt results."""
    queryset = Quiz.objects.all()

    def retrieve(self, request, pk=None):
        quiz = self.get_object()
        return Response(QuizSerializer(quiz).data)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        quiz = self.get_object()
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers_data = serializer.validated_data['answers']

        attempt = QuizAttempt.objects.create(
            user=request.user, quiz=quiz,
            total_questions=quiz.questions.count()
        )

        score = 0
        for q_id_str, choice_id in answers_data.items():
            q_id = int(q_id_str)
            try:
                question = quiz.questions.get(id=q_id)
                choice = question.choices.get(id=choice_id)
                is_correct = choice.is_correct
            except (Question.DoesNotExist, Choice.DoesNotExist):
                is_correct = False
                choice_id = choice_id

            if is_correct:
                score += 1
            QuizAnswer.objects.create(
                attempt=attempt, question_id=q_id,
                selected_choice_id=choice_id, is_correct=is_correct
            )

        threshold = 0.7 if quiz.quiz_type == 'assessment' else 0.5
        attempt.score = score
        attempt.passed = (score / attempt.total_questions) >= threshold if attempt.total_questions > 0 else False
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response(QuizResultSerializer(attempt).data)

    @action(detail=True, methods=['get'], url_path='results')
    def results(self, request, pk=None):
        quiz = self.get_object()
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        attempts = QuizAttempt.objects.filter(user=request.user, quiz=quiz)
        return Response(QuizResultSerializer(attempts, many=True).data)


class WishlistToggleView(APIView):
    """Toggle a course on/off the authenticated user's wishlist."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_slug = request.data.get('course_slug')
        if not course_slug:
            return Response({'detail': 'course_slug required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(slug=course_slug)
        except Course.DoesNotExist:
            return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        obj, created = Wishlist.objects.get_or_create(user=request.user, course=course)
        if not created:
            obj.delete()
            return Response({'wishlisted': False})
        return Response({'wishlisted': True}, status=status.HTTP_201_CREATED)


class WishlistListView(generics.ListAPIView):
    """List all wishlisted courses for the authenticated user."""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('course')


class PublicQuizView(APIView):
    """Public quiz endpoint for standalone/shareable quizzes (no auth required)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            quiz = Quiz.objects.get(standalone_slug=slug, is_public=True)
        except Quiz.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(QuizSerializer(quiz).data)

    def post(self, request, slug):
        try:
            quiz = Quiz.objects.get(standalone_slug=slug, is_public=True)
        except Quiz.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        answers_data = request.data.get('answers', {})
        score = 0
        total = quiz.questions.count()
        results = []
        for q_id_str, choice_id in answers_data.items():
            try:
                question = quiz.questions.get(id=int(q_id_str))
                choice = question.choices.get(id=choice_id)
                is_correct = choice.is_correct
            except (Question.DoesNotExist, Choice.DoesNotExist):
                is_correct = False
            if is_correct:
                score += 1
            results.append({'question_id': int(q_id_str), 'is_correct': is_correct})

        passed = (score / total * 100) >= quiz.passing_grade if total > 0 else False
        course_slug = quiz.course.slug if quiz.course else None
        return Response({
            'score': score, 'total': total, 'passed': passed,
            'results': results, 'course_slug': course_slug,
        })


class CourseInstructorsView(APIView):
    """List all instructors for a course (primary + co-instructors)."""
    def get(self, request, slug):
        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        instructors = CourseInstructor.objects.filter(course=course).select_related('instructor')
        data = []
        # Include primary instructor
        if course.instructor:
            data.append({
                'id': course.instructor.id,
                'name': course.instructor.get_full_name() or course.instructor.username,
                'avatar': getattr(course.instructor, 'avatar', ''),
                'bio': getattr(course.instructor, 'bio', ''),
                'role': 'primary',
            })
        for ci in instructors:
            if course.instructor and ci.instructor_id == course.instructor.id:
                continue
            data.append({
                'id': ci.instructor.id,
                'name': ci.instructor.get_full_name() or ci.instructor.username,
                'avatar': getattr(ci.instructor, 'avatar', ''),
                'bio': getattr(ci.instructor, 'bio', ''),
                'role': ci.role,
            })
        return Response(data)


from .models import DripSchedule, CourseFAQ, CourseNotice
from .serializers import DripScheduleSerializer, CourseFAQSerializer, CourseNoticeSerializer


class DripScheduleViewSet(viewsets.ModelViewSet):
    """CRUD for drip content schedules (timed module release)."""
    queryset = DripSchedule.objects.all()
    serializer_class = DripScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['course']


class CourseFAQViewSet(viewsets.ModelViewSet):
    """CRUD for course FAQs."""
    queryset = CourseFAQ.objects.all()
    serializer_class = CourseFAQSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['course']


class CourseNoticeViewSet(viewsets.ModelViewSet):
    """CRUD for course announcements/notices."""
    queryset = CourseNotice.objects.all()
    serializer_class = CourseNoticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['course']


# ─── Category ViewSet ───

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class_name = 'CategorySerializer'
    lookup_field = 'slug'

    def get_queryset(self):
        return Category.objects.filter(parent=None).prefetch_related('subcategories')

    def get_serializer_class(self):
        from .serializers import CategorySerializer
        return CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        import re
        name = serializer.validated_data.get('name', '')
        slug = serializer.validated_data.get('slug') or re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        base, i = slug, 1
        while Category.objects.filter(slug=slug).exists():
            slug = f'{base}-{i}'; i += 1
        serializer.save(slug=slug)


# ─── Admin Curriculum ViewSets ───

class ModuleAdminViewSet(viewsets.ModelViewSet):
    serializer_class_name = 'ModuleSerializer'
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        from .serializers import ModuleSerializer
        return ModuleSerializer

    def get_queryset(self):
        course_slug = self.kwargs.get('course_slug')
        return Module.objects.filter(course__slug=course_slug).order_by('order')

    def perform_create(self, serializer):
        from .models import Course
        course = Course.objects.get(slug=self.kwargs['course_slug'])
        last_order = Module.objects.filter(course=course).count()
        title = self.request.data.get('title', {'en': 'New Section'})
        serializer.save(course=course, order=last_order, title=title)

    def perform_update(self, serializer):
        serializer.save()


class LessonAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        from .serializers import LessonSerializer
        return LessonSerializer

    def get_queryset(self):
        module_pk = self.kwargs.get('module_pk')
        return Lesson.objects.filter(module_id=module_pk).order_by('order')

    def perform_create(self, serializer):
        module_pk = self.kwargs['module_pk']
        last_order = Lesson.objects.filter(module_id=module_pk).count()
        title = self.request.data.get('title', {'en': 'New Lesson'})
        lesson_type = self.request.data.get('lesson_type', 'text')
        serializer.save(module_id=module_pk, order=last_order, title=title, lesson_type=lesson_type)

    def perform_update(self, serializer):
        serializer.save()
