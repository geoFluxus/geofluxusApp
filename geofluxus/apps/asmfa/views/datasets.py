from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (DatasetType,
                                         Dataset)
from geofluxus.apps.asmfa.serializers import (DatasetTypeSerializer,
                                              DatasetSerializer)
from geofluxus.apps.asmfa.serializers import (DatasetTypeListSerializer,
                                              DatasetListSerializer)
from geofluxus.apps.asmfa.serializers import (DatasetTypeCreateSerializer,
                                              DatasetCreateSerializer)


# DatasetType
class DatasetTypeViewSet(PostGetViewMixin,
                         ViewSetMixin,
                         ModelPermissionViewSet):
    queryset = DatasetType.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = DatasetTypeSerializer
    serializers = {
        'list': DatasetTypeListSerializer,
        'create': DatasetTypeCreateSerializer
    }


# Dataset
class DatasetViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Dataset.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = DatasetSerializer
    serializers = {
        'list': DatasetListSerializer,
        'create': DatasetCreateSerializer
    }