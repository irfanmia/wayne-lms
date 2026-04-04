from rest_framework import serializers
from .models import (PricingPlan, MembershipPlan, Order, Installment,
                     GroupPricingTier, EarlyBirdPricing, MoneyBackGuarantee, ScholarshipApplication)


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = '__all__'


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = '__all__'


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return ''

    def get_course_name(self, obj):
        if obj.course:
            t = obj.course.title
            return t.get('en', str(t)) if isinstance(t, dict) else str(t)
        return ''


class GroupPricingTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupPricingTier
        fields = '__all__'


class EarlyBirdPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EarlyBirdPricing
        fields = '__all__'


class MoneyBackGuaranteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoneyBackGuarantee
        fields = '__all__'


class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipApplication
        fields = '__all__'
        read_only_fields = ['user']
