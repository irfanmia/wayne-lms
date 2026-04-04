from rest_framework import serializers
from .models import Group, GroupMember


class GroupMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'username', 'email', 'added_at']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)
    admin_name = serializers.CharField(source='admin.username', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'admin_name', 'course', 'max_seats', 'member_count', 'members', 'created_at']


class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    course_id = serializers.IntegerField()
    max_seats = serializers.IntegerField(default=10)
