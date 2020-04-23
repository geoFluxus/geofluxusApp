from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Ways)
from geofluxus.apps.asmfa.serializers import (WaysSerializer)


class WaysViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Ways.objects.using('routing').order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = WaysSerializer
    serializers = {
        'create': WaysSerializer
    }