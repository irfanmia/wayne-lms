from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('coupons', views.CouponViewSet, basename='coupon')
router.register('smart-coupons', views.SmartCouponConfigViewSet, basename='smart-coupon')
router.register('coupon-usage', views.CouponUsageViewSet, basename='coupon-usage')

urlpatterns = router.urls
