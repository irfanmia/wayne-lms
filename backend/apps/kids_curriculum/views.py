from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import KidCourse, KidLesson, KidChallenge
from .serializers import (KidCourseListSerializer, KidCourseDetailSerializer,
                          KidLessonSerializer, KidChallengeListSerializer, KidChallengeDetailSerializer)


class KidCourseViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = KidCourse.objects.filter(status='published')
        age_group = self.request.query_params.get('age_group')
        if age_group:
            qs = qs.filter(age_group=age_group)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return KidCourseDetailSerializer
        return KidCourseListSerializer


class KidChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = KidChallenge.objects.filter(lesson__course__status='published')
        difficulty = self.request.query_params.get('difficulty')
        challenge_type = self.request.query_params.get('type')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if challenge_type:
            qs = qs.filter(challenge_type=challenge_type)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return KidChallengeDetailSerializer
        return KidChallengeListSerializer
