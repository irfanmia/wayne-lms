from django.urls import path
from .views import (
    CheckoutView, PaymentHistoryView, SubscriptionStatusView,
    InstructorStatsView, InstructorRevenueView, CourseStatsView,
    InstructorCoursesView, InstructorStudentsView, InstructorQuizResultsView,
    AdminChartDataView,
)

urlpatterns = [
    path('payments/checkout/', CheckoutView.as_view()),
    path('payments/history/', PaymentHistoryView.as_view()),
    path('subscriptions/status/', SubscriptionStatusView.as_view()),
    path('analytics/instructor/', InstructorStatsView.as_view()),
    path('analytics/instructor/revenue/', InstructorRevenueView.as_view()),
    path('analytics/course/<int:course_id>/', CourseStatsView.as_view()),
    path('analytics/charts/', AdminChartDataView.as_view()),
    path('instructor/courses/', InstructorCoursesView.as_view()),
    path('instructor/courses/<int:course_id>/students/', InstructorStudentsView.as_view()),
    path('instructor/courses/<int:course_id>/students/add/', InstructorStudentsView.as_view()),
    path('instructor/courses/<int:course_id>/quiz-results/', InstructorQuizResultsView.as_view()),
]
