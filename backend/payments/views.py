from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer


class CreateCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        amount = request.data.get('amount', 0)
        payment = Payment.objects.create(
            user=request.user,
            course_id=course_id,
            amount=amount,
            status='pending',
        )
        # TODO: Integrate Stripe checkout session creation
        return Response({
            'payment_id': payment.id,
            'detail': 'Payment created. Stripe integration pending.',
        }, status=status.HTTP_201_CREATED)
