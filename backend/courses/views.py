from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Course, Enrollment, LessonProgress
from .serializers import (CategorySerializer, CourseListSerializer, CourseDetailSerializer,
                          EnrollmentSerializer, LessonProgressSerializer)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        try:
            # After migration: return only top-level categories with subcategories nested
            return Category.objects.filter(parent=None).prefetch_related('subcategories')
        except Exception:
            # Fallback before migration 0002 is applied (no parent column yet)
            return Category.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        import re
        name = serializer.validated_data.get('name', '')
        slug = serializer.validated_data.get('slug') or re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        # ensure uniqueness
        base = slug
        i = 1
        while Category.objects.filter(slug=slug).exists():
            slug = f'{base}-{i}'
            i += 1
        serializer.save(slug=slug)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('category', 'sub_category', 'instructor')
    lookup_field = 'slug'
    filterset_fields = ['category__slug', 'level', 'price_type', 'is_featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        import re
        data = self.request.data
        title_data = data.get('title', {})
        title = title_data.get('en', '') if isinstance(title_data, dict) else str(title_data)
        slug = data.get('slug') or re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        base = slug
        i = 1
        while Course.objects.filter(slug=slug).exists():
            slug = f'{base}-{i}'
            i += 1
        category_id = data.get('category_id')
        sub_category_id = data.get('sub_category_id')
        category = Category.objects.filter(id=category_id).first() if category_id else None
        sub_category = Category.objects.filter(id=sub_category_id).first() if sub_category_id else None
        desc_data = data.get('description', {})
        description = desc_data.get('en', '') if isinstance(desc_data, dict) else str(desc_data)
        serializer.save(
            slug=slug,
            title=title,
            description=description,
            category=category,
            sub_category=sub_category,
        )

    def perform_update(self, serializer):
        data = self.request.data
        title_data = data.get('title', {})
        title = title_data.get('en', '') if isinstance(title_data, dict) else str(title_data)
        category_id = data.get('category_id')
        sub_category_id = data.get('sub_category_id')
        category = Category.objects.filter(id=category_id).first() if category_id else None
        sub_category = Category.objects.filter(id=sub_category_id).first() if sub_category_id else None
        desc_data = data.get('description', {})
        description = desc_data.get('en', '') if isinstance(desc_data, dict) else str(desc_data)
        kwargs = {}
        if title:
            kwargs['title'] = title
        if description:
            kwargs['description'] = description
        if category_id is not None:
            kwargs['category'] = category
        if sub_category_id is not None:
            kwargs['sub_category'] = sub_category
        elif 'sub_category_id' in data and sub_category_id is None:
            kwargs['sub_category'] = None
        serializer.save(**kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if not created:
            return Response({'detail': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def progress(self, request, slug=None):
        course = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=course)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'POST':
            lesson_id = request.data.get('lesson_id')
            if lesson_id:
                from django.utils import timezone
                lp, _ = LessonProgress.objects.get_or_create(enrollment=enrollment, lesson_id=lesson_id)
                lp.completed = True
                lp.completed_at = timezone.now()
                lp.save()
                # Update progress percentage
                total = course.total_lectures()
                completed = enrollment.lesson_progress.filter(completed=True).count()
                enrollment.progress = (completed / total * 100) if total > 0 else 0
                enrollment.save()

        return Response({
            'progress': enrollment.progress,
            'completed_lessons': list(enrollment.lesson_progress.filter(completed=True).values_list('lesson_id', flat=True))
        })


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course')
