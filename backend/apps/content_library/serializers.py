from rest_framework import serializers
from .models import ReusableLesson, ReusableQuiz, ReusableQuizQuestion, ReusableAssignment


class ReusableLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReusableLesson
        fields = '__all__'


class ReusableQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReusableQuizQuestion
        fields = '__all__'


class ReusableQuizSerializer(serializers.ModelSerializer):
    questions = ReusableQuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ReusableQuiz
        fields = '__all__'


class ReusableAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReusableAssignment
        fields = '__all__'
