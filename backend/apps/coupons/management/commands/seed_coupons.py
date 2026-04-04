from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.coupons.models import Coupon, SmartCouponConfig


class Command(BaseCommand):
    help = 'Seed sample coupons'

    def handle(self, *args, **options):
        now = timezone.now()
        coupons = [
            {'code': 'WELCOME20', 'type': 'percentage', 'value': 20, 'valid_from': now, 'valid_to': now + timedelta(days=90)},
            {'code': 'FLAT10', 'type': 'fixed', 'value': 10, 'valid_from': now, 'valid_to': now + timedelta(days=60)},
            {'code': 'FREEBIE', 'type': 'free', 'value': 0, 'valid_from': now, 'valid_to': now + timedelta(days=30), 'usage_limit': 10},
        ]
        for c in coupons:
            Coupon.objects.get_or_create(code=c['code'], defaults=c)

        for ct in ['birthday', 'welcome', 'referral', 'abandoned_cart']:
            SmartCouponConfig.objects.get_or_create(coupon_type=ct, defaults={'discount_percentage': 10})

        self.stdout.write(self.style.SUCCESS('Seeded coupons'))
