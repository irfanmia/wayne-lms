import random
import string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Classroom, ClassroomMembership, ClassroomAssignment
from .serializers import (ClassroomListSerializer, ClassroomDetailSerializer,
                          ClassroomCreateSerializer, ClassroomAssignmentSerializer)
from apps.kids_profiles.models import KidProfile
from apps.kids_progress.models import KidProgress
from apps.kids_profiles.serializers import KidProfileSerializer


class ClassroomViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Classroom.objects.filter(teacher=self.request.user)

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ClassroomCreateSerializer
        if self.action == 'retrieve':
            return ClassroomDetailSerializer
        return ClassroomListSerializer

    def perform_create(self, serializer):
        join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        serializer.save(teacher=self.request.user, join_code=join_code)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign_challenge(self, request, pk=None):
        classroom = self.get_object()
        challenge_id = request.data.get('challenge_id')
        due_date = request.data.get('due_date')
        if not challenge_id:
            return Response({'detail': 'challenge_id required'}, status=status.HTTP_400_BAD_REQUEST)
        assignment, created = ClassroomAssignment.objects.get_or_create(
            classroom=classroom, challenge_id=challenge_id,
            defaults={'due_date': due_date}
        )
        return Response(ClassroomAssignmentSerializer(assignment).data,
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='progress')
    def student_progress(self, request, pk=None):
        classroom = self.get_object()
        memberships = classroom.memberships.all()
        data = []
        for m in memberships:
            completed = KidProgress.objects.filter(kid=m.kid, completed=True).count()
            data.append({
                'kid': KidProfileSerializer(m.kid).data,
                'challenges_completed': completed,
                'total_points': m.kid.total_points,
                'level': m.kid.current_level,
            })
        return Response(data)


class JoinClassroomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('join_code', '').upper()
        try:
            classroom = Classroom.objects.get(join_code=code, is_active=True)
        except Classroom.DoesNotExist:
            return Response({'detail': 'Invalid code'}, status=status.HTTP_404_NOT_FOUND)
        try:
            kid = KidProfile.objects.get(user=request.user)
        except KidProfile.DoesNotExist:
            return Response({'detail': 'No kid profile'}, status=status.HTTP_400_BAD_REQUEST)
        if classroom.memberships.count() >= classroom.max_students:
            return Response({'detail': 'Classroom is full'}, status=status.HTTP_400_BAD_REQUEST)
        membership, created = ClassroomMembership.objects.get_or_create(classroom=classroom, kid=kid)
        return Response({'joined': True, 'classroom': classroom.name},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class TeacherDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        classrooms = Classroom.objects.filter(teacher=request.user)
        data = []
        for c in classrooms:
            members = c.memberships.count()
            assignments = c.assignments.count()
            data.append({
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'join_code': c.join_code,
                'student_count': members,
                'assignment_count': assignments,
                'is_active': c.is_active,
            })
        return Response({'classrooms': data})
