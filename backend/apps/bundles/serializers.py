from rest_framework import serializers
from .models import Bundle
from apps.courses.serializers import CourseListSerializer


class BundleListSerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)
    discounted_price = serializers.FloatField(read_only=True)

    class Meta:
        model = Bundle
        fields = ['id', 'title', 'description', 'slug', 'price', 'discount_percent',
                  'discounted_price', 'course_count', 'thumbnail', 'is_active']


class BundleDetailSerializer(serializers.ModelSerializer):
    courses = CourseListSerializer(many=True, read_only=True)
    discounted_price = serializers.FloatField(read_only=True)

    class Meta:
        model = Bundle
        fields = ['id', 'title', 'description', 'slug', 'price', 'discount_percent',
                  'discounted_price', 'courses', 'thumbnail', 'is_active']
