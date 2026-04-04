import json
import subprocess
import tempfile
import os
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, SubmissionSerializer
from apps.courses.models import Enrollment


class AssignmentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrolled_courses = Enrollment.objects.filter(user=request.user).values_list('course_id', flat=True)
        assignments = Assignment.objects.filter(course_id__in=enrolled_courses)
        return Response(AssignmentSerializer(assignments, many=True, context={'request': request}).data)


class AssignmentDetailView(APIView):
    def get(self, request, pk):
        try:
            assignment = Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AssignmentSerializer(assignment, context={'request': request}).data)


def _run_auto_grade(assignment, code_content):
    """Run test_code against submitted code. Returns JSON result."""
    if not assignment.test_code or not code_content:
        return None
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Write student code
            student_file = os.path.join(tmpdir, 'solution.py')
            with open(student_file, 'w') as f:
                f.write(code_content)
            # Write test code
            test_file = os.path.join(tmpdir, 'test_solution.py')
            with open(test_file, 'w') as f:
                f.write(f"import sys\nsys.path.insert(0, '{tmpdir}')\n")
                f.write(assignment.test_code)
            # Run tests with timeout
            result = subprocess.run(
                ['python', '-m', 'pytest', test_file, '-v', '--tb=short', '--no-header'],
                capture_output=True, text=True, timeout=30, cwd=tmpdir
            )
            lines = result.stdout.strip().split('\n')
            tests = []
            for line in lines:
                if '::' in line and ('PASSED' in line or 'FAILED' in line):
                    test_name = line.split('::')[-1].split(' ')[0]
                    passed = 'PASSED' in line
                    tests.append({'name': test_name, 'passed': passed})
            passed_count = sum(1 for t in tests if t['passed'])
            return {
                'tests': tests,
                'passed': passed_count,
                'total': len(tests),
                'all_passed': passed_count == len(tests),
                'output': result.stdout[-500:] if result.stdout else '',
                'errors': result.stderr[-500:] if result.stderr else '',
            }
    except subprocess.TimeoutExpired:
        return {'tests': [], 'passed': 0, 'total': 0, 'all_passed': False, 'output': '', 'errors': 'Code execution timed out (30s limit)'}
    except Exception as e:
        return {'tests': [], 'passed': 0, 'total': 0, 'all_passed': False, 'output': '', 'errors': str(e)}


class AssignmentSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            assignment = Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check attempts
        existing_count = AssignmentSubmission.objects.filter(
            user=request.user, assignment=assignment
        ).count()
        if existing_count >= assignment.max_attempts:
            return Response(
                {'detail': f'Maximum attempts ({assignment.max_attempts}) reached.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attempt_number = existing_count + 1
        code_content = request.data.get('code_content', '')
        code_language = request.data.get('code_language', '')

        # Auto-grade if applicable
        auto_grade_result = None
        if assignment.auto_grade and assignment.submission_type == 'code' and code_content:
            auto_grade_result = _run_auto_grade(assignment, code_content)

        sub = AssignmentSubmission.objects.create(
            user=request.user,
            assignment=assignment,
            text_content=request.data.get('text_content', ''),
            url=request.data.get('url', ''),
            code_content=code_content,
            code_language=code_language,
            auto_grade_result=auto_grade_result,
            attempt_number=attempt_number,
            status='submitted',
        )
        if 'file' in request.FILES:
            sub.file = request.FILES['file']
            sub.save()

        return Response(SubmissionSerializer(sub).data, status=status.HTTP_201_CREATED)


class AssignmentAttemptsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        attempts = AssignmentSubmission.objects.filter(
            assignment_id=pk, user=request.user
        ).order_by('attempt_number')
        return Response(SubmissionSerializer(attempts, many=True).data)


class InstructorSubmissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        submissions = AssignmentSubmission.objects.filter(assignment_id=pk)
        return Response(SubmissionSerializer(submissions, many=True).data)


class InstructorGradeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, sub_id):
        try:
            sub = AssignmentSubmission.objects.get(pk=sub_id, assignment_id=pk)
        except AssignmentSubmission.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        sub.grade = request.data.get('grade', 0)
        sub.feedback = request.data.get('feedback', '')
        sub.status = 'graded'
        sub.graded_at = timezone.now()
        sub.graded_by = request.user
        sub.save()
        return Response(SubmissionSerializer(sub).data)
