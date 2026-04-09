from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PlatformSettings
from .serializers import PlatformSettingsSerializer


class PlatformSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        settings = PlatformSettings.get()
        data = PlatformSettingsSerializer(settings).data
        # Expose currency as alias for default_currency for frontend compat
        data['currency'] = data.get('default_currency', 'USD')
        return Response(data)

    def put(self, request):
        settings = PlatformSettings.get()
        data = request.data.copy()
        # Accept 'currency' as alias for 'default_currency'
        if 'currency' in data and 'default_currency' not in data:
            data['default_currency'] = data.pop('currency')
        ser = PlatformSettingsSerializer(settings, data=data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        resp_data = ser.data
        resp_data['currency'] = resp_data.get('default_currency', 'USD')
        return Response(resp_data)
