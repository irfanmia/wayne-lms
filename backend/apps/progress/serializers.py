from rest_framework import serializers
from .models import Enrollment, ExerciseSubmission, TrackProgress

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('user', 'enrolled_at')

class ExerciseSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseSubmission
        fields = '__all__'
        read_only_fields = ('user', 'status', 'output', 'submitted_at')

class TrackProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackProgress
        fields = '__all__'
        read_only_fields = ('user',)
