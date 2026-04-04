from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.db.models import Sum, Count
from .models import (PricingPlan, MembershipPlan, Order, Installment,
                     GroupPricingTier, EarlyBirdPricing, MoneyBackGuarantee, ScholarshipApplication)
from .serializers import (PricingPlanSerializer, MembershipPlanSerializer, OrderSerializer,
                          InstallmentSerializer, GroupPricingTierSerializer, EarlyBirdPricingSerializer,
                          MoneyBackGuaranteeSerializer, ScholarshipApplicationSerializer)


class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['course', 'pricing_type']


class MembershipPlanViewSet(viewsets.ModelViewSet):
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAuthenticated]


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        order = self.get_object()
        if order.status != 'completed':
            return Response({'error': 'Only completed orders can be refunded'}, status=400)
        order.status = 'refunded'
        order.refund_reason = request.data.get('reason', '')
        order.refunded_at = timezone.now()
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def revenue_stats(self, request):
        completed = Order.objects.filter(status='completed')
        return Response({
            'total_revenue': completed.aggregate(total=Sum('amount'))['total'] or 0,
            'total_orders': completed.count(),
            'refunded': Order.objects.filter(status='refunded').count(),
        })


class InstallmentViewSet(viewsets.ModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    permission_classes = [IsAuthenticated]


class GroupPricingTierViewSet(viewsets.ModelViewSet):
    queryset = GroupPricingTier.objects.all()
    serializer_class = GroupPricingTierSerializer
    permission_classes = [IsAuthenticated]


class EarlyBirdPricingViewSet(viewsets.ModelViewSet):
    queryset = EarlyBirdPricing.objects.all()
    serializer_class = EarlyBirdPricingSerializer
    permission_classes = [IsAuthenticated]


class MoneyBackGuaranteeViewSet(viewsets.ModelViewSet):
    queryset = MoneyBackGuarantee.objects.all()
    serializer_class = MoneyBackGuaranteeSerializer
    permission_classes = [IsAuthenticated]


class ScholarshipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ScholarshipApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ScholarshipApplication.objects.all()
        return ScholarshipApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
