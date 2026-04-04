from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PlatformSettings
from .serializers import PlatformSettingsSerializer


class PlatformSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        settings = PlatformSettings.get()
        return Response(PlatformSettingsSerializer(settings).data)

    def put(self, request):
        settings = PlatformSettings.get()
        ser = PlatformSettingsSerializer(settings, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
