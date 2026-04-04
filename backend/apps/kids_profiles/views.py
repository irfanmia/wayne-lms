from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import KidProfile, ParentProfile
from .serializers import KidProfileSerializer, KidProfileCreateSerializer, ParentProfileSerializer


class KidProfileViewSet(viewsets.ModelViewSet):
    serializer_class = KidProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'parent_profile'):
            return KidProfile.objects.filter(parent=user)
        return KidProfile.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return KidProfileCreateSerializer
        return KidProfileSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        try:
            profile = KidProfile.objects.get(user=request.user)
            return Response(KidProfileSerializer(profile).data)
        except KidProfile.DoesNotExist:
            return Response({'detail': 'No kid profile found'}, status=status.HTTP_404_NOT_FOUND)


class ParentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ParentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ParentProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        try:
            profile = ParentProfile.objects.get(user=request.user)
        except ParentProfile.DoesNotExist:
            return Response({'detail': 'No parent profile'}, status=status.HTTP_404_NOT_FOUND)
        kids = KidProfile.objects.filter(parent=request.user)
        from apps.kids_progress.models import KidProgress, KidAchievement, KidStreak
        children_data = []
        for kid in kids:
            progress = KidProgress.objects.filter(kid=kid)
            achievements = KidAchievement.objects.filter(kid=kid)
            streak = KidStreak.objects.filter(kid=kid).first()
            children_data.append({
                'profile': KidProfileSerializer(kid).data,
                'challenges_completed': progress.filter(completed=True).count(),
                'total_points': kid.total_points,
                'badges_earned': achievements.count(),
                'current_streak': streak.current_streak if streak else 0,
            })
        return Response({'children': children_data})
