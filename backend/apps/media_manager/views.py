from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import MediaFile
from .serializers import MediaFileSerializer


class MediaListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = MediaFile.objects.filter(uploaded_by=request.user)
        file_type = request.query_params.get('type')
        folder = request.query_params.get('folder')
        if file_type:
            qs = qs.filter(file_type=file_type)
        if folder:
            qs = qs.filter(folder=folder)
        return Response(MediaFileSerializer(qs, many=True).data)


class MediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        f = request.FILES.get('file')
        if not f:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        mime = f.content_type or ''
        if mime.startswith('image'):
            ft = 'image'
        elif mime.startswith('video'):
            ft = 'video'
        elif mime.startswith('audio'):
            ft = 'audio'
        else:
            ft = 'document'

        media = MediaFile.objects.create(
            uploaded_by=request.user,
            file=f,
            filename=f.name,
            file_type=ft,
            mime_type=mime,
            size_bytes=f.size,
            folder=request.data.get('folder', ''),
        )
        return Response(MediaFileSerializer(media).data, status=status.HTTP_201_CREATED)


class MediaDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            media = MediaFile.objects.get(pk=pk, uploaded_by=request.user)
        except MediaFile.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        media.file.delete()
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
