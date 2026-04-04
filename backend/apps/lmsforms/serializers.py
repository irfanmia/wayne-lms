from rest_framework import serializers
from .models import LMSForm, FormField


class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = ['id', 'field_name', 'field_label', 'field_type', 'placeholder', 'required', 'order', 'options']


class LMSFormSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)

    class Meta:
        model = LMSForm
        fields = ['id', 'name', 'form_type', 'is_active', 'fields']
