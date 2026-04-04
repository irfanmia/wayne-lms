from rest_framework import serializers
from .models import Classroom, ClassroomMembership, ClassroomAssignment
from apps.kids_profiles.serializers import KidProfileSerializer


class ClassroomMembershipSerializer(serializers.ModelSerializer):
    kid = KidProfileSerializer(read_only=True)

    class Meta:
        model = ClassroomMembership
        fields = ['id', 'kid', 'role', 'joined_at']


class ClassroomAssignmentSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_difficulty = serializers.CharField(source='challenge.difficulty', read_only=True)

    class Meta:
        model = ClassroomAssignment
        fields = ['id', 'challenge', 'challenge_title', 'challenge_difficulty', 'assigned_at', 'due_date', 'is_required']


class ClassroomListSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(source='memberships.count', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'slug', 'description', 'join_code', 'student_count',
                  'teacher_name', 'is_active', 'created_at']

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username


class ClassroomDetailSerializer(serializers.ModelSerializer):
    memberships = ClassroomMembershipSerializer(many=True, read_only=True)
    assignments = ClassroomAssignmentSerializer(many=True, read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Classroom
        fields = '__all__'

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username


class ClassroomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['name', 'slug', 'description', 'max_students']
