from rest_framework import serializers
from .models import Assignment, AssignmentSubmission


class SubmissionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'user', 'user_name', 'file', 'text_content', 'url',
                  'code_content', 'code_language', 'auto_grade_result', 'attempt_number',
                  'status', 'grade', 'feedback', 'submitted_at', 'graded_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()
    submission = serializers.SerializerMethodField()
    attempts_used = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'course', 'lesson', 'title', 'description', 'submission_type',
                  'answer_type', 'max_file_size', 'allowed_extensions', 'due_date', 'points',
                  'programming_language', 'starter_code', 'test_code', 'rubric',
                  'max_attempts', 'auto_grade', 'created_at', 'course_title',
                  'submission', 'attempts_used']

    def get_course_title(self, obj):
        t = obj.course.title
        return t.get('en', '') if isinstance(t, dict) else str(t)

    def get_submission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            sub = obj.submissions.filter(user=request.user).order_by('-attempt_number').first()
            if sub:
                return SubmissionSerializer(sub).data
        return None

    def get_attempts_used(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(user=request.user).count()
        return 0
