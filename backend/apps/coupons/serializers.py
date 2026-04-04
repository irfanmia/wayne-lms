from rest_framework import serializers
from .models import Coupon, SmartCouponConfig, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class SmartCouponConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartCouponConfig
        fields = '__all__'


class CouponUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponUsage
        fields = '__all__'


class ValidateCouponSerializer(serializers.Serializer):
    code = serializers.CharField()
    course_id = serializers.IntegerField(required=False)
