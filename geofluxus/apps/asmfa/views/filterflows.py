from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         Classification,
                                         Area,
                                         Routing,)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
from geofluxus.apps.login.models import (GroupDataset)
import json
import numpy as np
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery)
from django.contrib.gis.db.models import Union


# Filter Flow View
class FilterFlowViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    serializer_class = FlowSerializer
    model = Flow
    queryset = Flow.objects.all()

    def post_get(self, request, **kwargs):
        '''
        Override response for listing
        filtered flows according to user selections
        '''

        # retrieve request user
        user = request.user

        # anonymize for Demo Group
        anonymous = False
        user_groups = user.groups.values_list('name', flat=True)
        if 'Demo' in user_groups:
            anonymous = True

        # filter by query params
        queryset = self._filter(kwargs, query_params=request.query_params,
                                SerializerClass=self.get_serializer_class())

        # retrieve filters
        params = {}
        for key, value in request.data.items():
            try:
                params[key] = json.loads(value)
            except json.decoder.JSONDecodeError:
                params[key] = value

        # retrieve non-spatial filters
        filters = params.pop('flows', {})
        filters.pop('adminLevel', None)

        # filter on datasets
        datasets = filters.pop('datasets', None)
        queryset = queryset.filter(flowchain__dataset__id__in=datasets)

        # retrieve spatial filters
        origin_areas = params.pop('origin', {})
        destination_areas = params.pop('destination', {})
        flow_areas = filters.pop('selectedAreas', {})

        area_filters = {'origin': origin_areas,
                        'destination': destination_areas,
                        'flows': flow_areas}

        # filter flows with non-spatial filters
        queryset = self.filter(queryset, filters)

        # filter flows with spatial filters
        queryset = self.filter_areas(queryset, area_filters)

        # serialize data according to dimension
        dimensions = params.pop('dimensions', {})
        format = params.pop('format', None)
        data = self.serialize(queryset, dimensions, format, anonymous)
        return Response(data)

    # filter chain classifications
    @staticmethod
    def filter_classif(queryset, filter):
        '''
        Filter booleans with multiple selections
        '''
        queries = []
        func, vals = filter

        # annotate classification field to flows
        classifs = Classification.objects
        subq = classifs.filter(flowchain__id=OuterRef('flowchain__id'))
        queryset = queryset.annotate(**{func: Subquery(subq.values(func))})

        # filter
        for val in vals:
            queries.append(Q(**{func: val}))
        if len(queries) == 1:
            queryset = queryset.filter(queries[0])
        if len(queries) > 1:
            queryset = queryset.filter(np.bitwise_or.reduce(queries))
        return queryset

    # non-spatial filtering
    def filter(self, queryset, filters):
        '''
        Filter chains with generic filters
        (non-spatial filtering)
        '''

        # classification lookups
        # these should be handled separately!
        lookups = ['clean',
                   'mixed',
                   'direct',
                   'composite']

        # form queries
        queries = []
        for func, val in filters.items():
            # handle classifications (multiple booleans!)
            if func in lookups:
                queryset = self.filter_classif(queryset, (func, val))
                continue

            # form query & append
            query = Q(**{func: val})
            queries.append(query)

        # apply queries
        if len(queries) == 1:
            queryset = queryset.filter(queries[0])
        if len(queries) > 1:
            queryset = queryset.filter(np.bitwise_and.reduce(queries))

        return queryset

    # spatial filtering
    @staticmethod
    def filter_areas(queryset, filter):
        '''
        Filter chains with area filters
        (spatial filtering)
        '''

        # retrieve filters
        origin = filter['origin']
        destination = filter['destination']
        flows = filter['flows']

        # filter by origin
        area_ids = origin.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids)\
                               .aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            inOrOut = origin.pop('inOrOut', 'in')
            if inOrOut == 'in':
                queryset = queryset.filter(origin__geom__within=area)
            else:
                queryset = queryset.exclude(origin__geom__within=area)

        # filter by destination
        area_ids = destination.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids)\
                               .aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            inOrOut = destination.pop('inOrOut', 'in')
            if inOrOut == 'in':
                queryset = queryset.filter(destination__geom__within=area)
            else:
                queryset = queryset.exclude(destination__geom__within=area)

        # filter by flows
        area_ids = flows
        if area_ids:
            area = Area.objects.filter(id__in=area_ids)\
                               .aggregate(area=Union('geom'))['area']

            # select routings & check if they intersect the area
            ids = queryset.values_list('routing__id', flat=True).distinct()
            routings = Routing.objects.filter(id__in=ids)\
                                      .filter(geom__intersects=area)\
                                      .values_list('id', flat=True)

            # filter flows:
            # 1) with origin / destination within area OR
            # 2) with routing intersecting the area
            queryset = queryset.filter((Q(origin__geom__within=area) \
                                        & Q(destination__geom__within=area)) |
                                        Q(routing__id__in=routings))
        return queryset
