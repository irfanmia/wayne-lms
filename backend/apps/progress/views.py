from rest_framework import viewsets, permissions
from .models import Enrollment, ExerciseSubmission, TrackProgress
from .serializers import EnrollmentSerializer, ExerciseSubmissionSerializer, TrackProgressSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExerciseSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ExerciseSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExerciseSubmission.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TrackProgressViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TrackProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrackProgress.objects.filter(user=self.request.user)
