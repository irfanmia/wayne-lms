from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bundle
from .serializers import BundleListSerializer, BundleDetailSerializer


class BundleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bundle.objects.filter(is_active=True)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BundleDetailSerializer
        return BundleListSerializer

    @action(detail=True, methods=['post'], url_path='purchase')
    def purchase(self, request, slug=None):
        bundle = self.get_object()
        return Response({
            'status': 'success',
            'message': f'Bundle "{bundle.title}" purchased successfully (mock)',
            'bundle': bundle.title,
            'amount': bundle.discounted_price,
        }, status=status.HTTP_200_OK)
