from django.urls import path
from .views import (PointsBalanceView, PointsHistoryView, LeaderboardView,
                    RedeemPointsView, BadgeListView, MyBadgesView)

urlpatterns = [
    path('balance/', PointsBalanceView.as_view()),
    path('history/', PointsHistoryView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),
    path('redeem/', RedeemPointsView.as_view()),
    path('badges/', BadgeListView.as_view()),
    path('badges/my/', MyBadgesView.as_view()),
]
