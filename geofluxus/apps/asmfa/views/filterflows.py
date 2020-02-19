from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         FlowChain,
                                         Classification,
                                         Activity,
                                         ActivityGroup)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from collections import OrderedDict
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, F)


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
        # filter by query params
        queryset = self._filter(kwargs, query_params=request.query_params,
                                SerializerClass=self.get_serializer_class())

        # retrieve filters
        filters = {}
        for key, value in request.data.items():
            try:
                filters[key] = json.loads(value)
            except json.decoder.JSONDecodeError:
                filters[key] = value

        # retrieve display level
        displayLevel = filters.pop('displayLevel')
        inv_map = {v: k for k, v in LEVEL_KEYWORD.items()}
        aggregation_level = inv_map[displayLevel]

        # fetch all chains
        chains = FlowChain.objects.all()

        # annotate classifications to chains
        classifs = Classification.objects
        subq = classifs.filter(flowchain_id=OuterRef('pk'))
        chains = chains.annotate(mixed=Subquery(subq.values('mixed')),
                                 clean=Subquery(subq.values('clean')),
                                 direct=Subquery(subq.values('direct_use')),
                                 composite=Subquery(subq.values('composite')),
                                 )

        # classif lookups
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
            query = Q(**{func : val})
            queries.append(query)

        # apply queries
        if len(queries) == 1:
            chains = chains.filter(queries[0])
        if len(queries) > 1:
            chains = chains.filter(np.bitwise_and.reduce(queries))

        # retrieve flows from filtered chains
        ids = list(chains.values_list('id', flat=True))
        queryset = queryset.filter(flowchain_id__in=ids)
        data = self.serialize(queryset,
                              aggregation_level)

        return Response(data)

    # Filter booleans with multiple selections
    @staticmethod
    def filter_classif(queryset, filter):
        funcs = []
        lookup, options = filter
        for option in options:
            funcs.append(Q(**{lookup: option}))
        if len(funcs) == 1:
            queryset = queryset.filter(funcs[0])
        if len(funcs) > 1:
            queryset = queryset.filter(np.bitwise_or.reduce(funcs))
        return queryset

    # Serialize nodes of flows
    @staticmethod
    def serialize_nodes(nodes, add_fields=[]):
        '''
        serialize actors, activities or groups in the same way
        add_locations works, only for actors
        '''
        args = ['id', 'name'] + add_fields
        values = nodes.values(*args)
        node_dict = {v['id']: v for v in values}
        node_dict[None] = None
        return node_dict

    # Custom serializer for filtered flows
    def serialize(self, queryset, aggregation_level):
        '''
        serialize given queryset of flows to JSON,
        aggregates flows between nodes on actor level to the levels determined
        by origin_model and destination_model
        '''
        data = []

        # Annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'),
                                     description=F('flowchain__description'))

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

        groups = queryset.values(origin_filter,
                                 destination_filter,
                                 ).distinct()

        def get_code_field(model):
            if model == Activity:
                return 'nace'
            return 'code'

        origin_dict = self.serialize_nodes(
            origins,
            add_fields=[get_code_field(aggregation_level)]
        )
        destination_dict = self.serialize_nodes(
            destinations,
            add_fields=[get_code_field(aggregation_level)]
        )

        queryset = queryset.values('amount', 'description')
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