from django.urls import path
from .views import FormByTypeView, FormUpdateView, FormListView

urlpatterns = [
    path('', FormListView.as_view()),
    path('<str:form_type>/', FormByTypeView.as_view()),
    path('<int:pk>/update/', FormUpdateView.as_view()),
]
