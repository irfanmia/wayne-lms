import csv
import io
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.courses.models import Course, Enrollment
from .models import Group, GroupMember
from .serializers import GroupSerializer, GroupCreateSerializer

User = get_user_model()


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(admin=self.request.user)

    def create(self, request):
        s = GroupCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        course = Course.objects.get(id=s.validated_data['course_id'])
        group = Group.objects.create(
            name=s.validated_data['name'], admin=request.user,
            course=course, max_seats=s.validated_data['max_seats']
        )
        return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='members/add')
    def add_member(self, request, pk=None):
        group = self.get_object()
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)
        if group.members.count() >= group.max_seats:
            return Response({'detail': 'Group is full'}, status=400)
        GroupMember.objects.get_or_create(group=group, user=user, defaults={'added_by': request.user})
        Enrollment.objects.get_or_create(user=user, course=group.course)
        return Response({'detail': 'Member added'})

    @action(detail=True, methods=['post'], url_path='members/import-csv')
    def import_csv(self, request, pk=None):
        group = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'CSV file required'}, status=400)
        decoded = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        added = 0
        for row in reader:
            email = row.get('email', '').strip()
            if email:
                user, _ = User.objects.get_or_create(email=email, defaults={'username': email.split('@')[0]})
                if group.members.count() < group.max_seats:
                    GroupMember.objects.get_or_create(group=group, user=user, defaults={'added_by': request.user})
                    Enrollment.objects.get_or_create(user=user, course=group.course)
                    added += 1
        return Response({'detail': f'{added} members imported'})

    @action(detail=True, methods=['get'], url_path='progress')
    def progress(self, request, pk=None):
        group = self.get_object()
        members = group.members.select_related('user').all()
        data = []
        for m in members:
            enrollment = Enrollment.objects.filter(user=m.user, course=group.course).first()
            data.append({
                'username': m.user.username,
                'email': m.user.email,
                'progress': enrollment.progress_percent if enrollment else 0,
            })
        return Response(data)
