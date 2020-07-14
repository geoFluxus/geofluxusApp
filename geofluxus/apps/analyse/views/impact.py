from geofluxus.apps.analyse.views import MonitorViewSet
from django.db.models import (F, FloatField,
                              ExpressionWrapper,)
from django.db import connections
from collections import OrderedDict


class ImpactViewSet(MonitorViewSet):
    def annotate_amounts(self, queryset, indicator, impactSources, format):
        # based on vehicle, annotate emissions to flows
        queryset = queryset.annotate(**{indicator: F('vehicle__' + indicator)})

        # annotate amount from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # if network map, emission computed based on way length
        # indicator: grams per tonne kilometer
        # amount: tonnes
        # distance: meters -> kilometers
        expression = F(indicator) / 10**6 * F('amount')
        if format != 'networkmap':
            # annotate routing distance
            queryset = queryset.annotate(distance=F('routing__distance'))
            expression *= F('distance') / 10**3

        # update amounts
        amount = ExpressionWrapper(expression, output_field=FloatField())
        queryset = queryset.annotate(amount=amount)

        return queryset

    def serialize_network(self, ways):
        data = []

        # fetch network (with distances)
        cursor = connections['routing'].cursor()
        query = '''
                SELECT id, 
                       ST_AsText(the_geom),
                       ST_LengthSpheroid(the_geom,
                                         'SPHEROID["GRS_1980",6378137,298.257222101]')
                FROM ways
                '''
        cursor.execute(query)

        # serialize
        for way in cursor.fetchall():
            flow_item = []
            id, wkt, distance = way
            flow_item.append(('id', id))
            if id in ways:
                flow_item.append(('amount', ways[id] * distance / 10**3))
            else:
                flow_item.append(('amount', 0))
            data.append(OrderedDict(flow_item))

        return data