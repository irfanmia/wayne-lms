from rest_framework import serializers

class ExecuteRequestSerializer(serializers.Serializer):
    code = serializers.CharField()
    language = serializers.ChoiceField(choices=['python', 'javascript', 'typescript'])
    test_code = serializers.CharField(required=False, default='')

class ExecuteResponseSerializer(serializers.Serializer):
    stdout = serializers.CharField()
    stderr = serializers.CharField()
    exit_code = serializers.IntegerField()
    timed_out = serializers.BooleanField()
