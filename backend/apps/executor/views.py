from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import ExecuteRequestSerializer, ExecuteResponseSerializer
from .engine import execute

class ExecuteCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ExecuteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = execute(
            code=serializer.validated_data['code'],
            language=serializer.validated_data['language'],
            test_code=serializer.validated_data.get('test_code', ''),
        )
        return Response(ExecuteResponseSerializer(result).data, status=status.HTTP_200_OK)
