import csv
from django.http import HttpResponse
from django.db.models import Avg, Count, Q
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.courses.models import (Course, Enrollment, Lesson, LessonProgress,
                                  QuizAttempt)
from apps.assignments.models import AssignmentSubmission


def _student_grade(user, course):
    total_lessons = Lesson.objects.filter(module__course=course).count()
    completed = LessonProgress.objects.filter(
        user=user, lesson__module__course=course, completed=True
    ).count()
    lesson_pct = round(completed / total_lessons * 100) if total_lessons > 0 else 0

    quiz_attempts = QuizAttempt.objects.filter(user=user, quiz__course=course)
    quiz_avg = 0
    if quiz_attempts.exists():
        scores = []
        for a in quiz_attempts:
            if a.total_questions > 0:
                scores.append(a.score / a.total_questions * 100)
        quiz_avg = round(sum(scores) / len(scores)) if scores else 0

    subs = AssignmentSubmission.objects.filter(
        user=user, assignment__course=course, status='graded'
    )
    assignment_avg = 0
    if subs.exists():
        grades = [s.grade for s in subs if s.grade is not None]
        assignment_avg = round(sum(grades) / len(grades)) if grades else 0

    overall = round((lesson_pct + quiz_avg + assignment_avg) / 3)
    return {
        'lesson_pct': lesson_pct,
        'quiz_avg': quiz_avg,
        'assignment_avg': assignment_avg,
        'overall': overall,
    }


class InstructorGradebookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        enrollments = Enrollment.objects.filter(course=course).select_related('user')
        data = []
        for e in enrollments:
            grade = _student_grade(e.user, course)
            grade['student_name'] = e.user.get_full_name() or e.user.username
            grade['student_id'] = e.user.id
            data.append(grade)
        return Response(data)


class StudentGradebookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
        data = []
        for e in enrollments:
            grade = _student_grade(request.user, e.course)
            t = e.course.title
            grade['course_title'] = t.get('en', '') if isinstance(t, dict) else str(t)
            grade['course_id'] = e.course.id
            data.append(grade)
        return Response(data)


class GradebookExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="gradebook_{course_id}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Student', 'Lesson %', 'Quiz Avg', 'Assignment Avg', 'Overall'])

        enrollments = Enrollment.objects.filter(course=course).select_related('user')
        for e in enrollments:
            g = _student_grade(e.user, course)
            writer.writerow([
                e.user.get_full_name() or e.user.username,
                g['lesson_pct'], g['quiz_avg'], g['assignment_avg'], g['overall']
            ])
        return response
