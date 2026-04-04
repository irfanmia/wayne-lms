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
            if self.request.user.is_staff or self.request.user.is_superuser:
                return Certificate.objects.all()
            return Certificate.objects.filter(user=self.request.user)
        return Certificate.objects.none()

    @action(detail=False, methods=['get'], url_path='verify/(?P<cert_id>[^/.]+)')
    def verify(self, request, cert_id=None):
        try:
            cert = Certificate.objects.get(certificate_id=cert_id)
            return Response(CertificateSerializer(cert).data)
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found'}, status=404)
