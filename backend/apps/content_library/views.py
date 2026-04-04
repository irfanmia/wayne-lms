from rest_framework import viewsets, permissions
from .models import ReusableLesson, ReusableQuiz, ReusableQuizQuestion, ReusableAssignment
from .serializers import ReusableLessonSerializer, ReusableQuizSerializer, ReusableQuizQuestionSerializer, ReusableAssignmentSerializer


class ReusableLessonViewSet(viewsets.ModelViewSet):
    queryset = ReusableLesson.objects.all()
    serializer_class = ReusableLessonSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReusableQuizViewSet(viewsets.ModelViewSet):
    queryset = ReusableQuiz.objects.prefetch_related('questions').all()
    serializer_class = ReusableQuizSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReusableQuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = ReusableQuizQuestion.objects.all()
    serializer_class = ReusableQuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReusableAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ReusableAssignment.objects.all()
    serializer_class = ReusableAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
