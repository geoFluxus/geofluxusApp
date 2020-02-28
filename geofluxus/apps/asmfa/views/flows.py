from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         Routing)
from geofluxus.apps.asmfa.serializers import (FlowChainSerializer,
                                              FlowSerializer,
                                              ClassificationSerializer,
                                              ExtraDescriptionSerializer,
                                              RoutingSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainListSerializer,
                                              FlowListSerializer,
                                              ClassificationListSerializer,
                                              ExtraDescriptionListSerializer,
                                              RoutingListSerializer)
from geofluxus.apps.asmfa.serializers import (FlowChainCreateSerializer,
                                              FlowCreateSerializer,
                                              ClassificationCreateSerializer,
                                              ExtraDescriptionCreateSerializer,
                                              RoutingCreateSerializer)
from django.db import connection
from django.contrib.gis.geos import GEOSGeometry
import json
from collections import OrderedDict
from rest_framework.response import Response


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


# Routing
class RoutingViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Routing.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ExtraDescriptionSerializer
    serializers = {
        'list': RoutingListSerializer,
        'create': RoutingCreateSerializer
    }

    # def list(self, request, **kwargs):
    #     cursor = connection.cursor()
    #     cursor.execute(
    #         '''
    #         SELECT DISTINCT(ST_AsText(ST_Intersection(a.geom, b.geom)))
    #         FROM asmfa_routing a
    #         LEFT JOIN asmfa_routing b
    #         ON (ST_Overlaps(a.geom, b.geom))
    #         WHERE a.id < b.id
    #         '''
    #     )
    #
    #     lines = cursor.fetchall()
    #     data = []
    #     idx = 1
    #     for line in lines[:-1]:
    #         geom = GEOSGeometry(line[0])
    #         item = OrderedDict(
    #             {'geom': json.loads(geom.geojson)}
    #         )
    #         data.append(item)
    #         idx += 1
    #
    #     return Response(data)
