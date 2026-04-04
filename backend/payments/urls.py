from django.urls import path
from .views import CreateCheckoutView

urlpatterns = [
    path('payments/create-checkout/', CreateCheckoutView.as_view(), name='create-checkout'),
]
