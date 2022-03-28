from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Routing,
                                         Vehicle)
from geofluxus.apps.asmfa.serializers import (FlowChainSerializer,
                                              FlowSerializer,
                                              RoutingSerializer,
                                              VehicleSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainListSerializer,
                                              FlowListSerializer,
                                              RoutingListSerializer,
                                              VehicleListSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainCreateSerializer,
                                              FlowCreateSerializer,
                                              RoutingCreateSerializer,
                                              VehicleCreateSerializer)


# Routing
class RoutingViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Routing.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = RoutingSerializer
    serializers = {
        'list': RoutingListSerializer,
        'create': RoutingCreateSerializer
    }


# Vehicle
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


# FlowChain
class FlowChainViewSet(PostGetViewMixin,
                       ViewSetMixin,
                       ModelPermissionViewSet):
    queryset = FlowChain.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = FlowChainSerializer
    serializers = {
        'list': FlowChainListSerializer,
        'create': FlowChainCreateSerializer
    }


# Flow
class FlowViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Flow.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = FlowSerializer
    serializers = {
        'list': FlowListSerializer,
        'create': FlowCreateSerializer
    }