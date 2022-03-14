from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         Area,
                                         Routing,
                                         Month,
                                         Waste06)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, Sum)
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
        filters.pop('adminLevel', None) # no need for adminlevel

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

        # record flow number & amount
        requestFlowCount = params.get('requestFlowCount', None)
        if requestFlowCount:
            original_amount = queryset.aggregate(total=Sum('flowchain__amount'))['total']
            data = {
                'original_count': queryset.count(),
                'original_amount': original_amount
            }

        # filter flows with non-spatial filters
        queryset = self.filter(queryset, filters)

        # filter flows with spatial filters
        queryset = self.filter_areas(queryset, area_filters)

        # if request for flow count, send data now
        if requestFlowCount:
            final_amount = queryset.aggregate(total=Sum('flowchain__amount'))['total']
            data['final_count'] = queryset.count()
            data['final_amount'] = final_amount
            return Response(data)

        # serialization parameters
        serials = {'anonymous': anonymous}  # anonymize data for demo
        serialParams = [
            'dimensions',     # dimensions to process (time, space etc.)
            'format',         # special format (flow map, parallel sets etc.)
            'indicator',      # indicator to compute (waste amount, emission etc.)
            'impactSources',  # sources of impact (transportation, processing etc.)
        ]
        for param in serialParams:
            serials[param] = params.pop(param, None)

        # serialize data
        data = self.serialize(queryset, **serials)
        return Response(data)

    # filter on ewc lookup
    @staticmethod
    def filter_ewc(queryset, filter):
        func, vals = filter
        search = list(Waste06.objects.values_list(func, flat=True) \
                                     .order_by(func) \
                                     .distinct())
        vals = [int(v) for v in vals]

        func = f'flowchain__waste06__{func}__in'
        vals = [v for v in search if search.index(v) in vals]
        queryset = queryset.filter(**{func: vals})

        return queryset

    # filter on multiple boolean
    @staticmethod
    def filter_boolean(queryset, filter):
        '''
        Filter booleans with multiple selections
        '''
        queries = []
        func, vals = filter
        func = f'flowchain__waste06__{func}'

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

        # lookups for special fields
        ewc_lookups = [
            'agendas',
            'industries',
            'chains'
        ]
        multiple_booleans = [
            'clean',
            'mixed',
            'direct_use',
            'composite'
        ]

        # form queries
        queries = []
        for func, val in filters.items():
            # handle ewc lookups
            if func in ewc_lookups:
                queryset = self.filter_ewc(queryset, (func, val))
                continue

            # handle multiple booleans
            if func in multiple_booleans:
                queryset = self.filter_boolean(queryset, (func, val))
                continue

            if 'year' in func:
                val = list(Month.objects.filter(year__in=val).values_list('id', flat=True))
                func = 'flowchain__month__in'

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

        # filter by origin / destination
        nodes = ['origin', 'destination']
        for node in nodes:
            area_ids = filter[node].pop('selectedAreas', [])
            if area_ids:
                area = Area.objects.filter(id__in=area_ids)\
                                   .aggregate(area=Union('geom'))['area']

                # check where with respect to the area
                inOrOut = filter[node].pop('inOrOut', 'in')
                kwargs = {node + '__geom__within': area}
                if inOrOut == 'in':
                    queryset = queryset.filter(**kwargs)
                else:
                    queryset = queryset.exclude(**kwargs)

        # filter by flows
        area_ids = filter['flows']
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
