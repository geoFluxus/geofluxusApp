from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         Classification,
                                         Area,
                                         Routing,
                                         Month,
                                         Waste06)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, Sum, Count)
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
        # if requestFlowCount:
        #     original_amount = queryset.aggregate(count=Count('pk'),
        #                                          amount=Sum('flowchain__amount'))
        #     data = {
        #         'original_count': original_amount['count'],
        #         'original_amount': original_amount['amount']
        #     }

        # filter flows with non-spatial filters
        queryset = self.filter(queryset, filters)

        # filter flows with spatial filters
        queryset = self.filter_areas(queryset, area_filters)

        # if request for flow count, send data now
        if requestFlowCount:
            final_amount = queryset.aggregate(count=Count('pk'),
                                              amount=Sum('flowchain__amount'))
            data = {
                'original_count': 0,
                'original_amount': 0,
                'final_count': final_amount['count'],
                'final_amount': final_amount['amount']
            }
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
                   'direct_use',
                   'composite']

        # form queries
        queries = []
        for func, val in filters.items():
            # handle classifications (multiple booleans!)
            if func in lookups:
                queryset = self.filter_classif(queryset, (func, val))
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
