from rest_framework import serializers
from .models import LiveClass, LiveClassAttendance


class LiveClassListSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    attendee_count = serializers.IntegerField(source='attendees.count', read_only=True)

    class Meta:
        model = LiveClass
        fields = [
            'id', 'title', 'course', 'course_title', 'course_slug',
            'instructor', 'instructor_name', 'platform', 'meeting_url',
            'scheduled_at', 'duration', 'status', 'attendee_count',
        ]

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.username


class LiveClassSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    attendee_count = serializers.IntegerField(source='attendees.count', read_only=True)

    class Meta:
        model = LiveClass
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.username


class LiveClassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveClass
        fields = [
            'title', 'description', 'course', 'platform', 'meeting_url',
            'meeting_id', 'scheduled_at', 'duration', 'max_attendees',
            'timezone', 'recording_url',
        ]

    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)


class LiveClassAttendanceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LiveClassAttendance
        fields = ['id', 'live_class', 'user', 'username', 'joined_at', 'left_at']
        read_only_fields = ['joined_at']
