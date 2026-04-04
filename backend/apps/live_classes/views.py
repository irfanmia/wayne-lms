from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LiveClass, LiveClassAttendance
from .serializers import (
    LiveClassSerializer, LiveClassListSerializer,
    LiveClassCreateSerializer, LiveClassAttendanceSerializer,
)


class LiveClassViewSet(viewsets.ModelViewSet):
    queryset = LiveClass.objects.select_related('course', 'instructor').all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return LiveClassListSerializer
        if self.action == 'create':
            return LiveClassCreateSerializer
        return LiveClassSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        course = self.request.query_params.get('course')
        if course:
            qs = qs.filter(course__slug=course)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        platform = self.request.query_params.get('platform')
        if platform:
            qs = qs.filter(platform=platform)
        return qs

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        course = request.query_params.get('course')
        qs = LiveClass.objects.filter(
            scheduled_at__gte=timezone.now(),
            status__in=['scheduled', 'live'],
        ).select_related('course', 'instructor')
        if course:
            qs = qs.filter(course__slug=course)
        qs = qs.order_by('scheduled_at')[:5]
        serializer = LiveClassListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='course/(?P<course_id>[^/.]+)')
    def by_course(self, request, course_id=None):
        qs = LiveClass.objects.filter(course_id=course_id).select_related('course', 'instructor')
        serializer = LiveClassListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        lc = self.get_object()
        lc.status = 'live'
        lc.save(update_fields=['status', 'updated_at'])
        return Response(LiveClassSerializer(lc).data)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        lc = self.get_object()
        lc.status = 'completed'
        lc.save(update_fields=['status', 'updated_at'])
        return Response(LiveClassSerializer(lc).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        lc = self.get_object()
        lc.status = 'cancelled'
        lc.save(update_fields=['status', 'updated_at'])
        return Response(LiveClassSerializer(lc).data)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        lc = self.get_object()
        attendance, created = LiveClassAttendance.objects.get_or_create(
            live_class=lc, user=request.user,
        )
        return Response(
            LiveClassAttendanceSerializer(attendance).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
