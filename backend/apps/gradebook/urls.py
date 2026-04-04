from django.urls import path
from .views import InstructorGradebookView, StudentGradebookView, GradebookExportView

urlpatterns = [
    path('student/', StudentGradebookView.as_view()),
    path('course/<int:course_id>/', InstructorGradebookView.as_view()),
    path('course/<int:course_id>/export/', GradebookExportView.as_view()),
]
