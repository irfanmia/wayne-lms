from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('pricing-plans', views.PricingPlanViewSet, basename='pricing-plan')
router.register('membership-plans', views.MembershipPlanViewSet, basename='membership-plan')
router.register('orders', views.OrderViewSet, basename='order')
router.register('installments', views.InstallmentViewSet, basename='installment')
router.register('group-pricing', views.GroupPricingTierViewSet, basename='group-pricing')
router.register('early-bird', views.EarlyBirdPricingViewSet, basename='early-bird')
router.register('money-back', views.MoneyBackGuaranteeViewSet, basename='money-back')
router.register('scholarships', views.ScholarshipApplicationViewSet, basename='scholarship')

urlpatterns = router.urls
