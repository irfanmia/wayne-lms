import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .models import Coupon, SmartCouponConfig, CouponUsage
from .serializers import CouponSerializer, SmartCouponConfigSerializer, CouponUsageSerializer, ValidateCouponSerializer


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='bulk-generate', permission_classes=[IsAdminUser])
    def bulk_generate(self, request):
        """Generate multiple coupon codes with a prefix."""
        prefix = request.data.get('prefix', 'MC')
        count = min(int(request.data.get('count', 10)), 500)  # Cap at 500
        discount_type = request.data.get('discount_type', 'percentage')
        discount_value = request.data.get('discount_value', 10)
        usage_limit = request.data.get('usage_limit', 1)
        now = timezone.now()
        valid_to = now + timedelta(days=90)

        created = []
        for _ in range(count):
            code = f"{prefix}-{uuid.uuid4().hex[:6].upper()}"
            coupon = Coupon.objects.create(
                code=code, type=discount_type, value=discount_value,
                usage_limit=usage_limit, valid_from=now, valid_to=valid_to,
                scope='all', active=True, created_by=request.user,
            )
            created.append(coupon)
        return Response({
            'count': len(created),
            'codes': [c.code for c in created],
            'coupons': CouponSerializer(created, many=True).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        ser = ValidateCouponSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        code = ser.validated_data['code']
        course_id = ser.validated_data.get('course_id')
        now = timezone.now()
        try:
            coupon = Coupon.objects.get(code=code, active=True, valid_from__lte=now, valid_to__gte=now)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid or expired coupon'}, status=400)
        if coupon.used_count >= coupon.usage_limit:
            return Response({'valid': False, 'error': 'Coupon usage limit reached'}, status=400)
        if coupon.scope == 'selected' and course_id and not coupon.courses.filter(id=course_id).exists():
            return Response({'valid': False, 'error': 'Coupon not valid for this course'}, status=400)
        return Response({'valid': True, 'type': coupon.type, 'value': str(coupon.value), 'coupon_id': coupon.id})


class SmartCouponConfigViewSet(viewsets.ModelViewSet):
    queryset = SmartCouponConfig.objects.all()
    serializer_class = SmartCouponConfigSerializer
    permission_classes = [IsAdminUser]


class CouponUsageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CouponUsage.objects.all()
    serializer_class = CouponUsageSerializer
    permission_classes = [IsAdminUser]
