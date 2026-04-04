from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmailTemplate, EmailLog, BulkEmail
from .serializers import EmailTemplateSerializer, EmailLogSerializer, BulkEmailSerializer, SendTestEmailSerializer


class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='send-test')
    def send_test(self, request):
        ser = SendTestEmailSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        # In production, actually send email here
        EmailLog.objects.create(
            template_id=ser.validated_data['template_id'],
            to_email=ser.validated_data['to_email'],
            subject='Test Email',
            status='sent',
        )
        return Response({'status': 'sent'}, status=status.HTTP_200_OK)


class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmailLog.objects.all().order_by('-sent_at')
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAuthenticated]


class BulkEmailViewSet(viewsets.ModelViewSet):
    queryset = BulkEmail.objects.all().order_by('-created_at')
    serializer_class = BulkEmailSerializer
    permission_classes = [permissions.IsAuthenticated]
