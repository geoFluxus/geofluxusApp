from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         Classification,
                                         Area,
                                         Routing,
                                         Month,
                                         Year)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from collections import OrderedDict
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, F)
from django.contrib.gis.db.models import Union


MODEL = {
    'month': Month,
    'year': Year
}


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

        # retrieve spatial filters
        origin = params.pop('origin', {})
        destination = params.pop('destination', {})
        flow_areas = filters.pop('selectedAreas', {})

        area_filters = {}
        area_filters['origin'] = origin
        area_filters['destination'] = destination
        area_filters['flows'] = flow_areas

        # filter flows with non-spatial filters
        queryset = self.filter(queryset, filters)

        # filter flows with spatial filters
        queryset = self.filter_areas(queryset, area_filters)

        # recover chain ids
        ids = queryset.values_list('flowchain', flat=True).distinct()
        # recover full chain
        flows = Flow.objects
        flows = flows.filter(flowchain__id__in=ids)

        # serialize data according to dimension
        dimensions = params.pop('dimensions', {})
        data = self.serialize(queryset, dimensions)
        return Response(data)

    # filter chain classifications
    def filter_classif(self, queryset, filter):
        '''
        Filter booleans with multiple selections
        '''
        queries = []
        func, vals = filter
        for val in vals:
            queries.append(Q(**{func:val}))
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

        # annotate classifications to flows
        classifs = Classification.objects
        subq = classifs.filter(flowchain__id=OuterRef('flowchain__id'))
        queryset = queryset.annotate(mixed=Subquery(subq.values('mixed')),
                                     clean=Subquery(subq.values('clean')),
                                     direct=Subquery(subq.values('direct_use')),
                                     composite=Subquery(subq.values('composite')),
                                    )

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
            func = 'flowchain__' + func # search in chain!!!
            query = Q(**{func: val})
            queries.append(query)

        # apply queries
        if len(queries) == 1:
            queryset = queryset.filter(queries[0])
        if len(queries) > 1:
            queryset = queryset.filter(np.bitwise_and.reduce(queries))

        return queryset

    # spatial filtering
    def filter_areas(self, queryset, filter):
        '''
        Filter chains with area filters
        (spatial filtering)
        '''

        # retrieve selected areas
        origin = filter['origin']
        destination = filter['destination']
        flow_areas = filter['flows']

        # filter by origin
        area_ids = origin.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            where = origin.pop('where', 'in')
            if where == 'in':
                queryset = queryset.filter(origin__geom__within=area)
            else:
                queryset = queryset.exclude(origin__geom__within=area)

        # filter by destination
        area_ids = destination.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            where = destination.pop('where', 'in')
            if where == 'in':
                queryset = queryset.filter(destination__geom__within=area)
            else:
                queryset = queryset.exclude(destination__geom__within=area)

        # # filter by flows
        # area_ids = flow_areas
        # if area_ids:
        #     # retrieve routings
        #     routings = Routing.objects
        #
        #     subq = routings.filter(flowchain__id=OuterRef('flowchain__id'))

        return queryset

    # def serialize_nodes(self, nodes, add_fields=[]):
    #     '''
    #     serialize actors, activities or groups in the same way
    #     add_locations works, only for actors
    #     '''
    #     args = ['id', 'name'] + add_fields
    #     values = nodes.values(*args)
    #     node_dict = {v['id']: v for v in values}
    #     node_dict[None] = None
    #     return node_dict

    def serialize(self, queryset, dimensions):
        data = []

        # recover dimensions
        time = dimensions.pop('time', None)

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # group flow origins / destinations
        time_level = time.split('__')[-1]
        time_model = MODEL[time_level]
        time_values = time_model.objects.filter(
            id__in=list(queryset.values_list(time, flat=True))).values_list('id', 'code')
        time_dict = dict(time_values)
        # workaround Django ORM bug
        queryset = queryset.order_by()

        # aggregate flows into groups
        groups = queryset.values(time).distinct()

        # serialize aggregated flow groups
        for group in groups:
            grouped = queryset.filter(**group)
            queryset = queryset.exclude(**group)

            group_amount = sum(grouped.values_list('amount', flat=True))

            flow_item = OrderedDict((
                (time_level, time_dict[group[time]]),
                ('amount', group_amount),
            ))
            data.append(flow_item)
        return data