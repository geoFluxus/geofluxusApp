from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area)
from geofluxus.apps.asmfa.serializers import (AdminLevelSerializer,
                                              AreaSerializer)
from geofluxus.apps.asmfa.serializers import (AdminLevelListSerializer,
                                              AreaListSerializer)
from geofluxus.apps.asmfa.serializers import (AdminLevelCreateSerializer,
                                              AreaCreateSerializer)
from rest_framework.response import Response


# AdminLevel
class AdminLevelViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    queryset = AdminLevel.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AdminLevelSerializer
    serializers = {
        'list': AdminLevelListSerializer,
        'create': AdminLevelCreateSerializer
    }


# Area
class AreaViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Area.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AreaSerializer
    serializers = {
        'list': AreaListSerializer,
        'create': AreaCreateSerializer
    }


# AreaInLevel
class AreaInLevelViewSet(PostGetViewMixin,
                         ViewSetMixin,
                         ModelPermissionViewSet):
    queryset = Area.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AreaSerializer

    def list(self, request, level_pk=None):
        queryset = Area.objects.simplified(level=level_pk)
        serializer = AreaSerializer(queryset,
                                    many=True,
                                    context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None, level_pk=None):
        queryset = Area.objects.filter(pk=pk,
                                       adminlevel=level_pk)
        serializer = AreaSerializer(queryset,
                                    many=True,
                                    context={'request': request})
        return Response(serializer.data)