from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Flow,
                                         FlowChain,
                                         Classification,
                                         Area,
                                         Routing,
                                         Month,
                                         Year,
                                         Activity,
                                         ActivityGroup,
                                         Actor)
from geofluxus.apps.asmfa.serializers import (FlowSerializer)
import json
import numpy as np
from collections import OrderedDict
from rest_framework.response import Response
from django.db.models import (Q, OuterRef, Subquery, F)
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
        origin_areas = params.pop('origin', {})
        destination_areas = params.pop('destination', {})
        flow_areas = filters.pop('selectedAreas', {})

        area_filters = {}
        area_filters['origin'] = origin_areas
        area_filters['destination'] = destination_areas
        area_filters['flows'] = flow_areas

        # filter flows with non-spatial filters
        queryset = self.filter(queryset, filters)

        # filter flows with spatial filters
        queryset = self.filter_areas(queryset, area_filters)

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
            func = func # search in chain!!!
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

        # retrieve filters
        origin = filter['origin']
        destination = filter['destination']
        flows = filter['flows']

        # filter by origin
        area_ids = origin.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            inOrOut = origin.pop('inOrOut', 'in')
            if inOrOut == 'in':
                queryset = queryset.filter(origin__geom__within=area)
            else:
                queryset = queryset.exclude(origin__geom__within=area)

        # filter by destination
        area_ids = destination.pop('selectedAreas', [])
        if area_ids:
            area = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))['area']

            # check where with respect to the area
            inOrOut = destination.pop('inOrOut', 'in')
            if inOrOut == 'in':
                queryset = queryset.filter(destination__geom__within=area)
            else:
                queryset = queryset.exclude(destination__geom__within=area)

        # filter by flows
        area_ids = flows
        if area_ids:
            area = Area.objects.filter(id__in=area_ids).aggregate(area=Union('geom'))['area']

            # FIRST TEST
            # filter flows with origin / destination
            # within the selected area
            inside = queryset.filter(Q(origin__geom__within=area) &\
                                     Q(destination__geom__within=area))

            # SECOND TEST
            # check routing for rest
            outside = queryset.exclude(Q(origin__geom__within=area) &\
                                       Q(destination__geom__within=area))

            # retrieve routings
            routings = Routing.objects.filter(geom__intersects=area)

            # annotate routings to flows
            subq = routings.filter(Q(origin=OuterRef('origin')) &\
                                   Q(destination=OuterRef('destination')))
            inside = inside.annotate(routing=Subquery(subq.values('geom')))
            outside = outside.annotate(routing=Subquery(subq.values('geom')))
            outside = outside.exclude(routing=None)

            # FIRST / SECOND TEST UNION
            queryset = inside.union(outside)

        return queryset

    def serialize(self, queryset, dimensions):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # recover dimensions
        time = dimensions.pop('time', None)
        space = dimensions.pop('space', None)
        eco = dimensions.pop('economicActivity', None)
        treat = dimensions.pop('treatmentMethod', None)
        mat = dimensions.pop('material', None)

        # TIME DIMENSION
        levels, fields = [], []
        if time:
            levels.append(time.split('__')[-1])
            fields.append(time)

        # SPACE DIMENSION
        if space:
            # recover all areas of the selected
            # administrative level
            adminlevel = space.pop('adminlevel', None)
            if adminlevel:
                areas = Area.objects.filter(adminlevel=adminlevel)

            # attach to flows the area
            # to which their origin / destination belongs
            field = space.pop('field', None)
            if field:
                # Actor level is the only one
                # with no areas!
                if areas.count() != 0:
                    # recover the area id to which
                    # the flow origin / destination belongs
                    subq = areas.filter(geom__contains=OuterRef(field))

                    # annotate to area id to flows
                    queryset = queryset.annotate(area=Subquery(subq.values('id')))

                    # append to other dimensions
                    levels.append('area')
                    fields.append('area')
                else:
                    # annotate origin / destination id
                    field = field.split('__')[0] + '__id'
                    queryset = queryset.annotate(actor=F(field))

                    # append to other dimensions
                    levels.append('actor')
                    fields.append('actor')

        # ECO DIMENSION
        if eco:
            levels.append(eco.split('__')[-1])
            fields.append(eco)

        # TREAT DIMENSION
        if treat:
            levels.append(treat.split('__')[-1])
            fields.append(treat)

        # MATERIAL DIMENSION
        if mat:
            levels.append(mat.split('__')[-1])
            fields.append(mat)

        # workaround Django ORM bug
        queryset = queryset.order_by()

        # aggregate flows into groups
        groups = queryset.values(*fields).distinct()

        # serialize aggregated flow groups
        for group in groups:
            # check for groups fields with null values!
            # these groups should be excluded entirely
            has_null = False
            for field, value in group.items():
                if not value:
                    has_null = True
                    break
            if has_null: continue

            # retrieve group
            grouped = queryset.filter(**group)
            # and EXCLUDE it from further search...
            #queryset = queryset.exclude(**group)

            # aggregate amount
            group_amount = sum(grouped.values_list('amount', flat=True))

            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group_amount)]
            for level, field in zip(levels, fields):
                if field == 'area':
                    # recover area info
                    area = Area.objects.filter(id=group[field])[0]

                    # serialize area
                    flow_item.append(('areaId', area.id))
                    flow_item.append(('areaName', area.name))
                elif field == 'actor':
                    # recover
                    actor = Actor.objects.filter(id=group[field])[0]

                    # serialize actor
                    flow_item.append(('actorId', actor.id))
                    flow_item.append(('actorName', actor.company.identifier))
                    flow_item.append(('lon', actor.geom.x))
                    flow_item.append(('lat', actor.geom.y))
                else:
                    flow_item.append((level, group[field]))

            data.append(OrderedDict(flow_item))
        return data