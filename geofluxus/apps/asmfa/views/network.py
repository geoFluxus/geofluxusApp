from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Ways,
                                         Vehicle)
from geofluxus.apps.asmfa.serializers import (WaysSerializer,
                                              VehicleSerializer)
from geofluxus.apps.asmfa.serializers import (WaysListSerializer,
                                              VehicleListSerializer)
from geofluxus.apps.asmfa.serializers import (VehicleCreateSerializer)


class WaysViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Ways.objects.using('routing').order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = WaysSerializer
    serializers = {
        'list': WaysListSerializer
    }


class VehicleViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Vehicle.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = VehicleSerializer
    serializers = {
        'list': VehicleListSerializer,
        'create': VehicleCreateSerializer
    }