import uuid
from django.db.models import Sum, Count
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Payment, Subscription
from .serializers import PaymentSerializer, SubscriptionSerializer
from apps.courses.models import Course, Enrollment, QuizAttempt, LessonProgress


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount', 0)
        method = request.data.get('payment_method', 'stripe')
        payment = Payment.objects.create(
            user=request.user, amount=amount, payment_method=method,
            status='completed', reference_id=str(uuid.uuid4())[:16],
            description=request.data.get('description', 'Course purchase')
        )
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user)[:50]
        return Response(PaymentSerializer(payments, many=True).data)


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            sub = Subscription.objects.get(user=request.user)
            return Response(SubscriptionSerializer(sub).data)
        except Subscription.DoesNotExist:
            return Response({'plan': None, 'status': 'none'})


class InstructorStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_staff or request.user.is_superuser:
            courses = Course.objects.all()
            total_enrollments = Enrollment.objects.count()
            total_revenue = Payment.objects.filter(status='completed').aggregate(
                total=Sum('amount'))['total'] or 0
            completed = Enrollment.objects.filter(completed_at__isnull=False).count()
        else:
            courses = Course.objects.filter(instructor=request.user)
            total_enrollments = Enrollment.objects.filter(course__in=courses).count()
            total_revenue = Payment.objects.filter(user=request.user, status='completed').aggregate(
                total=Sum('amount'))['total'] or 0
            completed = Enrollment.objects.filter(course__in=courses, completed_at__isnull=False).count()
        return Response({
            'total_courses': courses.count(),
            'total_enrollments': total_enrollments,
            'total_revenue': float(total_revenue),
            'completion_rate': round(completed / total_enrollments * 100) if total_enrollments else 0,
        })


class InstructorRevenueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Mock monthly revenue data
        return Response({
            'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'revenue': [1200, 1800, 2400, 2100, 3200, 2800],
        })


class CourseStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        course = Course.objects.get(id=course_id)
        enrollments = Enrollment.objects.filter(course=course)
        return Response({
            'course': course.title,
            'total_enrolled': enrollments.count(),
            'avg_progress': round(sum(e.progress_percent for e in enrollments) / max(enrollments.count(), 1)),
            'completed': enrollments.filter(completed_at__isnull=False).count(),
            'quiz_attempts': QuizAttempt.objects.filter(quiz__course=course).count(),
        })


class AdminChartDataView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models.functions import TruncMonth
        from datetime import datetime, timedelta
        from django.utils import timezone

        # Enrollment trend: enrollments per month for last 6 months
        six_months_ago = timezone.now() - timedelta(days=180)
        enrollment_trend = (
            Enrollment.objects.filter(enrolled_at__gte=six_months_ago)
            .annotate(month=TruncMonth('enrolled_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        enrollment_data = [
            {'month': e['month'].strftime('%b'), 'value': e['count']}
            for e in enrollment_trend
        ]

        # Revenue per month
        revenue_trend = (
            Payment.objects.filter(status='completed', created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        revenue_data = [
            {'month': r['month'].strftime('%b'), 'value': float(r['total'] or 0)}
            for r in revenue_trend
        ]

        # Top courses by enrollment
        top_courses_qs = (
            Course.objects.annotate(student_count=Count('enrollments'))
            .order_by('-student_count')[:5]
        )
        max_students = top_courses_qs.first().student_count if top_courses_qs.exists() and top_courses_qs.first().student_count else 1
        top_courses = [
            {'name': c.title, 'students': c.student_count, 'pct': round(c.student_count / max_students * 100) if max_students else 0}
            for c in top_courses_qs
        ]

        # Completion rate by category (category is a CharField on Course)
        categories = (
            Course.objects.values_list('category', flat=True)
            .distinct()
            .order_by('category')
        )
        completion_rates = []
        colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500']
        for i, cat in enumerate(list(categories)[:5]):
            if not cat:
                continue
            total_enroll = Enrollment.objects.filter(course__category=cat).count()
            completed = Enrollment.objects.filter(course__category=cat, completed_at__isnull=False).count()
            rate = round(completed / total_enroll * 100) if total_enroll else 0
            completion_rates.append({
                'cat': cat, 'rate': rate, 'color': colors[i % len(colors)]
            })

        return Response({
            'enrollment_trend': enrollment_data,
            'revenue_trend': revenue_data,
            'top_courses': top_courses,
            'completion_rates': completion_rates,
        })


class InstructorCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.courses.serializers import CourseListSerializer
        courses = Course.objects.filter(instructor=request.user)
        return Response(CourseListSerializer(courses, many=True).data)


class InstructorStudentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        enrollments = Enrollment.objects.filter(course_id=course_id).select_related('user')
        data = [{
            'user_id': e.user.id, 'username': e.user.username, 'email': e.user.email,
            'progress': e.progress_percent, 'enrolled_at': e.enrolled_at,
        } for e in enrollments]
        return Response(data)

    def post(self, request, course_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)
        Enrollment.objects.get_or_create(user=user, course_id=course_id)
        return Response({'detail': 'Student added'})

    def delete(self, request, course_id):
        user_id = request.data.get('user_id')
        Enrollment.objects.filter(user_id=user_id, course_id=course_id).delete()
        return Response({'detail': 'Student removed'})


class InstructorQuizResultsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        attempts = QuizAttempt.objects.filter(quiz__course_id=course_id).select_related('user', 'quiz')[:100]
        data = [{
            'user': a.user.username, 'quiz': a.quiz.title,
            'score': a.score, 'total': a.total_questions,
            'passed': a.passed, 'date': a.started_at,
        } for a in attempts]
        return Response(data)
