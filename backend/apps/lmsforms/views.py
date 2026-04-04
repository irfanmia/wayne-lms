from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import LMSForm, FormField
from .serializers import LMSFormSerializer, FormFieldSerializer


class FormByTypeView(APIView):
    def get(self, request, form_type):
        try:
            form = LMSForm.objects.get(form_type=form_type)
        except LMSForm.DoesNotExist:
            return Response({'detail': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(LMSFormSerializer(form).data)


class FormUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        try:
            form = LMSForm.objects.get(pk=pk)
        except LMSForm.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        form.name = request.data.get('name', form.name)
        form.is_active = request.data.get('is_active', form.is_active)
        form.save()

        # Update fields if provided
        fields_data = request.data.get('fields', [])
        if fields_data:
            form.fields.all().delete()
            for i, fd in enumerate(fields_data):
                FormField.objects.create(
                    form=form, field_name=fd.get('field_name', ''),
                    field_label=fd.get('field_label', ''),
                    field_type=fd.get('field_type', 'text'),
                    placeholder=fd.get('placeholder', ''),
                    required=fd.get('required', False),
                    order=fd.get('order', i),
                    options=fd.get('options', []),
                )
        return Response(LMSFormSerializer(form).data)


class FormListView(APIView):
    def get(self, request):
        forms = LMSForm.objects.all()
        return Response(LMSFormSerializer(forms, many=True).data)
