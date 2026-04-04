from django.urls import path
from .views import (AssignmentListView, AssignmentDetailView, AssignmentSubmitView,
                    AssignmentAttemptsView, InstructorSubmissionsView, InstructorGradeView)

urlpatterns = [
    path('', AssignmentListView.as_view()),
    path('<int:pk>/', AssignmentDetailView.as_view()),
    path('<int:pk>/submit/', AssignmentSubmitView.as_view()),
    path('<int:pk>/attempts/', AssignmentAttemptsView.as_view()),
    path('<int:pk>/submissions/', InstructorSubmissionsView.as_view()),
    path('<int:pk>/submissions/<int:sub_id>/grade/', InstructorGradeView.as_view()),
]
