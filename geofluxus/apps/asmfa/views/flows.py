from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription)
from geofluxus.apps.asmfa.serializers import (FlowChainSerializer,
                                              FlowSerializer,
                                              ClassificationSerializer,
                                              ExtraDescriptionSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainListSerializer,
                                              FlowListSerializer,
                                              ClassificationListSerializer,
                                              ExtraDescriptionListSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainCreateSerializer,
                                              FlowCreateSerializer,
                                              ClassificationCreateSerializer,
                                              ExtraDescriptionCreateSerializer)


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

    def get_queryset(self):
        queryset = FlowChain.objects.order_by('id')
        return queryset


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

    def get_queryset(self):
        queryset = Flow.objects.order_by('id')
        return queryset


# Classification
class ClassificationViewSet(PostGetViewMixin,
                            ViewSetMixin,
                            ModelPermissionViewSet):
    queryset = Classification.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ClassificationSerializer
    serializers = {
        'list': ClassificationListSerializer,
        'create': ClassificationCreateSerializer
    }

    def get_queryset(self):
        queryset = Classification.objects.order_by('id')
        return queryset


# ExtraDescription
class ExtraDescriptionViewSet(PostGetViewMixin,
                              ViewSetMixin,
                              ModelPermissionViewSet):
    queryset = ExtraDescription.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ExtraDescriptionSerializer
    serializers = {
        'list': ExtraDescriptionListSerializer,
        'create': ExtraDescriptionCreateSerializer
    }

    def get_queryset(self):
        queryset = ExtraDescription.objects.order_by('id')
        return queryset