from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UserPoints, PointTransaction, PointConfig, Badge, UserBadge
from .serializers import UserPointsSerializer, PointTransactionSerializer, LeaderboardSerializer, BadgeSerializer


class PointsBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        points, _ = UserPoints.objects.get_or_create(user=request.user)
        return Response(UserPointsSerializer(points).data)


class PointsHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        txns = PointTransaction.objects.filter(user=request.user)[:50]
        return Response(PointTransactionSerializer(txns, many=True).data)


class LeaderboardView(APIView):
    def get(self, request):
        top = UserPoints.objects.select_related('user').order_by('-total_points')[:20]
        return Response(LeaderboardSerializer(top, many=True).data)


class RedeemPointsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        points, _ = UserPoints.objects.get_or_create(user=request.user)
        cost = 500  # mock cost
        if points.available_points < cost:
            return Response({'detail': 'Not enough points'}, status=status.HTTP_400_BAD_REQUEST)
        points.redeemed_points += cost
        points.save()
        PointTransaction.objects.create(
            user=request.user, action='redeemed', points=-cost,
            description=f'Redeemed for course {course_id}'
        )
        return Response({'detail': 'Points redeemed successfully', 'remaining': points.available_points})


class BadgeListView(APIView):
    def get(self, request):
        badges = Badge.objects.all()
        data = BadgeSerializer(badges, many=True).data
        if request.user.is_authenticated:
            earned_ids = set(UserBadge.objects.filter(user=request.user).values_list('badge_id', flat=True))
            for b in data:
                b['earned'] = b['id'] in earned_ids
        return Response(data)


class MyBadgesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        earned = UserBadge.objects.filter(user=request.user).select_related('badge')
        data = []
        for ub in earned:
            bd = BadgeSerializer(ub.badge).data
            bd['earned'] = True
            bd['earned_at'] = ub.earned_at
            data.append(bd)
        return Response(data)
