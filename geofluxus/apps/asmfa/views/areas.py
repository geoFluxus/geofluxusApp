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


# AdminLevel
class AdminLevelViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    queryset = AdminLevel.objects.all()
    serializer_class = AdminLevelSerializer
    serializers = {
        'list': AdminLevelListSerializer,
        'create': AdminLevelCreateSerializer
    }

    def get_queryset(self):
        queryset = AdminLevel.objects.all()
        return queryset


# Area
class AreaViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    serializers = {
        'list': AreaListSerializer,
        'create': AreaCreateSerializer
    }

    def get_queryset(self):
        queryset = Area.objects.all()
        return queryset