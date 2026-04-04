from rest_framework import serializers
from .models import KidCourse, KidLesson, KidChallenge


class KidChallengeListSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)

    class Meta:
        model = KidChallenge
        fields = ['id', 'title', 'slug', 'description', 'difficulty', 'challenge_type',
                  'points', 'icon_emoji', 'lesson_title', 'course_title', 'order']


class KidChallengeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidChallenge
        fields = '__all__'


class KidLessonSerializer(serializers.ModelSerializer):
    challenges = KidChallengeListSerializer(many=True, read_only=True)

    class Meta:
        model = KidLesson
        fields = ['id', 'title', 'slug', 'description', 'intro_text', 'icon_emoji', 'order', 'challenges']


class KidCourseListSerializer(serializers.ModelSerializer):
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)
    challenge_count = serializers.SerializerMethodField()

    class Meta:
        model = KidCourse
        fields = ['id', 'title', 'slug', 'description', 'age_group', 'thumbnail',
                  'icon_emoji', 'color', 'lesson_count', 'challenge_count', 'order']

    def get_challenge_count(self, obj):
        return KidChallenge.objects.filter(lesson__course=obj).count()


class KidCourseDetailSerializer(serializers.ModelSerializer):
    lessons = KidLessonSerializer(many=True, read_only=True)

    class Meta:
        model = KidCourse
        fields = '__all__'
