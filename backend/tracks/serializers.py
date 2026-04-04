from rest_framework import serializers
from .models import Track, Concept, Exercise, Submission, TrackEnrollment


class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = '__all__'


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class TrackListSerializer(serializers.ModelSerializer):
    exercise_count = serializers.SerializerMethodField()
    concept_count = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = ['id', 'name', 'slug', 'description', 'icon', 'difficulty',
                  'is_featured', 'student_count', 'exercise_count', 'concept_count']

    def get_exercise_count(self, obj):
        return obj.exercises.count()

    def get_concept_count(self, obj):
        return obj.concepts.count()


class TrackDetailSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True, read_only=True)
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = Track
        fields = '__all__'


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['user', 'status', 'test_results', 'submitted_at']


class TrackEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackEnrollment
        fields = '__all__'
        read_only_fields = ['user']
