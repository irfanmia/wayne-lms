from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Certificate.objects.filter(user=self.request.user)
        return Certificate.objects.none()

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def verify(self, request, pk=None):
        try:
            cert = Certificate.objects.get(pk=pk)
            return Response(CertificateSerializer(cert).data)
        except Certificate.DoesNotExist:
            return Response({'detail': 'Certificate not found'}, status=404)
