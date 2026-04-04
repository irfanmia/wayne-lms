from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Track, Exercise, Submission, TrackEnrollment
from .serializers import (TrackListSerializer, TrackDetailSerializer,
                          ExerciseSerializer, SubmissionSerializer)


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Track.objects.all()
    lookup_field = 'slug'
    filterset_fields = ['difficulty', 'is_featured']
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TrackDetailSerializer
        return TrackListSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, slug=None):
        track = self.get_object()
        enrollment, created = TrackEnrollment.objects.get_or_create(user=request.user, track=track)
        if not created:
            return Response({'detail': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        track.student_count += 1
        track.save()
        return Response({'detail': 'Enrolled successfully'}, status=status.HTTP_201_CREATED)

    @action(detail=True, url_path='exercises', methods=['get'])
    def exercises(self, request, slug=None):
        track = self.get_object()
        exercises = track.exercises.all().order_by('order')
        return Response(ExerciseSerializer(exercises, many=True).data)

    @action(detail=True, url_path='exercises/(?P<exercise_slug>[^/.]+)/submit',
            methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, slug=None, exercise_slug=None):
        track = self.get_object()
        try:
            exercise = track.exercises.get(slug=exercise_slug)
        except Exercise.DoesNotExist:
            return Response({'detail': 'Exercise not found'}, status=status.HTTP_404_NOT_FOUND)
        submission = Submission.objects.create(
            user=request.user, exercise=exercise,
            code=request.data.get('code', ''), status='pending'
        )
        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)
