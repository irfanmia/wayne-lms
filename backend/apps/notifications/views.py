from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EmailTemplate, NotificationLog
from .serializers import EmailTemplateSerializer, NotificationLogSerializer


class EmailTemplateListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        templates = EmailTemplate.objects.all()
        return Response(EmailTemplateSerializer(templates, many=True).data)


class EmailTemplateDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        try:
            template = EmailTemplate.objects.get(pk=pk)
        except EmailTemplate.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmailTemplateSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = NotificationLog.objects.all()[:100]
        return Response(NotificationLogSerializer(logs, many=True).data)
