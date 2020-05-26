from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (PublicationType,
                                         Publication)
from geofluxus.apps.asmfa.serializers import (PublicationTypeSerializer,
                                              PublicationSerializer)
from geofluxus.apps.asmfa.serializers import (PublicationTypeListSerializer,
                                              PublicationListSerializer)
from geofluxus.apps.asmfa.serializers import (PublicationTypeCreateSerializer,
                                              PublicationCreateSerializer)


# PublicationType
class PublicationTypeViewSet(PostGetViewMixin,
                             ViewSetMixin,
                             ModelPermissionViewSet):
    queryset = PublicationType.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = PublicationTypeSerializer
    serializers = {
        'list': PublicationTypeListSerializer,
        'create': PublicationTypeCreateSerializer
    }


# Publication
class PublicationViewSet(PostGetViewMixin,
                         ViewSetMixin,
                         ModelPermissionViewSet):
    queryset = Publication.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = PublicationSerializer
    serializers = {
        'list': PublicationListSerializer,
        'create': PublicationCreateSerializer
    }