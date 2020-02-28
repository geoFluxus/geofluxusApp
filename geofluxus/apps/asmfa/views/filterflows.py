from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         FlowChain,
                                         Classification,
                                         Activity,
                                         ActivityGroup,
                                         Area)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from collections import OrderedDict
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, F)
from django.contrib.gis.db.models import Union


FILTER_SUFFIX = {
    Activity: '__activity',
    ActivityGroup: '__activity__activitygroup'
}

LEVEL_KEYWORD = {
    Activity: 'activity',
    ActivityGroup: 'activitygroup'
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

        # retrieve display level
        display_level = params.pop('displayLevel')
        inv_map = {v: k for k, v in LEVEL_KEYWORD.items()}
        aggregation_level = inv_map[display_level]

        # retrieve area & generic filters
        area_filters = params.pop('areaFilters')
        gen_filters = params.pop('genFilters')

        # fetch all chains
        chains = FlowChain.objects.all()

        # filter chains with area filters
        chains = self.filter_areas(queryset, chains, area_filters)

        # filter chains with generic filters
        chains = self.filter(chains, gen_filters)

        # retrieve flows from filtered chains
        ids = list(chains.values_list('id', flat=True))
        queryset = queryset.filter(flowchain_id__in=ids)
        data = self.serialize(queryset,
                              aggregation_level)

        return Response(data)

    def filter_areas(self, queryset, chains, filters):
        '''
        Filter chains with area filters
        (spatial filtering)
        '''

        # retrieve selected areas
        area_ids = filters.pop('areas', None)
        # spatial filtering without areas ?!
        if not area_ids:
            return chains
        else:
            areas = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))

        # retrieve role
        role = filters.pop('role')

        # retrieve activities or activity groups
        acts, ids = [], []
        if len(filters) > 0:
            acts, ids = filters.popitem()

        # form queries
        intersects, is_ins = [], []
        # production nodes (check origin)
        if role in ['production', 'all', 'any']:
            subq = queryset.filter(flowchain_id=OuterRef('pk'),
                                   origin_role='Ontdoener')

            # retrieve production location for chains
            chains = chains.annotate(pro_geom=
                                     Subquery(subq.values('origin__geom')))
            intersects.append('pro_geom__intersects')

            # add production activity or activitygroup
            if acts:
                chains = chains.annotate(pro_act=
                                         Subquery(subq.values('origin' + acts)))
                is_ins.append('pro_act__in')

        # collection nodes (check either origin or destination)
        # check only origin to avoid duplicates
        if role in ['collection', 'all', 'any']:
            subq = queryset.filter(flowchain_id=OuterRef('pk'),
                                   origin_role='Ontvanger')

            # retrieve collection location for chains
            chains = chains.annotate(col_geom=
                                     Subquery(subq.values('origin__geom')))
            intersects.append('col_geom__intersects')

            # add collection activity or activitygroup
            if acts:
                chains = chains.annotate(col_act=
                                         Subquery(subq.values('origin' + acts)))
                is_ins.append('col_act__in')

        # treatment nodes (check destination)
        if role in ['treatment', 'all', 'any']:
            subq = queryset.filter(flowchain_id=OuterRef('pk'),
                                   destination_role='Verwerker')

            # retrieve collection location for chains
            chains = chains.annotate(treat_geom=
                                     Subquery(subq.values('destination__geom')))
            intersects.append('treat_geom__intersects')

            # add treatment activity or activitygroup
            if acts:
                chains = chains.annotate(treat_act=
                                         Subquery(subq.values('destination' + acts)))
                is_ins.append('treat_act__in')

        # collect queries
        filter_functions = []
        # not activity/group check
        if not is_ins:
            for intersect in intersects:
                filter_functions.append(Q(**{intersect: areas['area']}))
        else:
            for intersect, is_in in zip(intersects, is_ins):
                filter_functions.append(Q(**{intersect: areas['area'],
                                             is_in: ids}))

        # apply queries to chains
        if role == 'all':
            # ALL nodes should satisfy the criteria
            chains = chains.filter(np.bitwise_and.reduce(filter_functions))
        elif role == 'any':
            # ANY node should satisfy the criteria
            chains = chains.filter(np.bitwise_or.reduce(filter_functions))
        else:
            # REQUESTED node should satisfy the criteria
            chains = chains.filter(filter_functions[0])

        return chains

    def filter(self, chains, filters):
        '''
        Filter chains with generic filters
        (non-spatial filtering)
        '''

        # annotate classifications to chains
        classifs = Classification.objects
        subq = classifs.filter(flowchain_id=OuterRef('pk'))
        chains = chains.annotate(mixed=Subquery(subq.values('mixed')),
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
            # handle multiple booleans
            if func in lookups:
                filter = (func, val)
                chains = self.filter_classif(chains, filter)
                continue

            # form query & append
            query = Q(**{func: val})
            queries.append(query)

        # apply queries
        if len(queries) == 1:
            chains = chains.filter(queries[0])
        if len(queries) > 1:
            chains = chains.filter(np.bitwise_and.reduce(queries))

        return chains

    def filter_classif(self, queryset, filter):
        '''
        Filter booleans with multiple selections
        '''
        funcs = []
        lookup, options = filter
        for option in options:
            funcs.append(Q(**{lookup: option}))
        if len(funcs) == 1:
            queryset = queryset.filter(funcs[0])
        if len(funcs) > 1:
            queryset = queryset.filter(np.bitwise_or.reduce(funcs))
        return queryset

    def serialize_nodes(self, nodes, add_fields=[]):
        '''
        serialize actors, activities or groups in the same way
        add_locations works, only for actors
        '''
        args = ['id', 'name'] + add_fields
        values = nodes.values(*args)
        node_dict = {v['id']: v for v in values}
        node_dict[None] = None
        return node_dict

    def serialize(self, queryset, aggregation_level):
        '''
        serialize given queryset of flows to JSON,
        aggregates flows between nodes on actor level to the levels determined
        by origin_model and destination_model
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # collect flow origins / destinations
        # according to aggregation_level
        origin_filter = 'origin' + FILTER_SUFFIX[aggregation_level] + '__id'
        destination_filter = 'destination' + FILTER_SUFFIX[aggregation_level] + '__id'
        origin_level = LEVEL_KEYWORD[aggregation_level]
        destination_level = LEVEL_KEYWORD[aggregation_level]
        origins = aggregation_level.objects.filter(
            id__in=list(queryset.values_list(origin_filter, flat=True)))
        destinations = aggregation_level.objects.filter(
            id__in=list(queryset.values_list(destination_filter, flat=True)))
        # workaround Django ORM bug
        queryset = queryset.order_by()

        # aggregate flows into groups
        groups = queryset.values(origin_filter,
                                 destination_filter,
                                 ).distinct()

        def get_code_field(model):
            if model == Activity:
                return 'nace'
            return 'code'

        # serialize origins / destinations
        origin_dict = self.serialize_nodes(
            origins,
            add_fields=[get_code_field(aggregation_level)]
        )
        destination_dict = self.serialize_nodes(
            destinations,
            add_fields=[get_code_field(aggregation_level)]
        )

        # serialize aggregated flow groups
        for group in groups:
            grouped = queryset.filter(**group)
            queryset = queryset.exclude(**group)

            origin_item = origin_dict[group[origin_filter]]
            origin_item['level'] = origin_level
            dest_item = destination_dict[group[destination_filter]]
            dest_item['level'] = destination_level

            total_amount = sum(grouped.values_list('amount', flat=True))

            flow_item = OrderedDict((
                ('origin', origin_item),
                ('destination', dest_item),
                ('amount', total_amount),
            ))
            data.append(flow_item)
        return data