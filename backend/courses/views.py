from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Course, Enrollment, LessonProgress
from .serializers import (CategorySerializer, CourseListSerializer, CourseDetailSerializer,
                          EnrollmentSerializer, LessonProgressSerializer)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_published=True).select_related('category', 'instructor')
    lookup_field = 'slug'
    filterset_fields = ['category__slug', 'level', 'price_type', 'is_featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

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
