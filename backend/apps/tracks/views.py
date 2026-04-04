from rest_framework import viewsets, generics
from rest_framework.pagination import PageNumberPagination
from .models import Track, Concept, Exercise
from .serializers import TrackListSerializer, TrackDetailSerializer, ExerciseSerializer, ConceptSerializer


class NoPagination(PageNumberPagination):
    page_size = None


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Track.objects.filter(is_active=True)
    lookup_field = 'slug'
    pagination_class = NoPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TrackDetailSerializer
        return TrackListSerializer


class ConceptListView(generics.ListAPIView):
    serializer_class = ConceptSerializer

    def get_queryset(self):
        track_slug = self.kwargs.get('track_slug')
        return Concept.objects.filter(track__slug=track_slug).prefetch_related('exercises')


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExerciseSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Exercise.objects.select_related('concept__track').all()
        track_slug = self.kwargs.get('track_slug') or self.request.query_params.get('track')
        if track_slug:
            qs = qs.filter(concept__track__slug=track_slug)
        return qs
