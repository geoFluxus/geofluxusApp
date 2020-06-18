from geofluxus.apps.analyse.views import MonitorViewSet
from django.db.models import (F, FloatField, Sum,
                              ExpressionWrapper,)
from django.contrib.gis.db.models.functions import Length
from django.db import connections


class ImpactViewSet(MonitorViewSet):
    def annotate_amounts(self, queryset, indicator, impactSources):
        # annotate amount from chains to flows
        # exclude flows with no trips
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # based on vehicle, annotate emissions to flows
        queryset = queryset.annotate(**{indicator: F('vehicle__' + indicator)})

        # annotate routing distance
        # exclude flows with no routing
        queryset = queryset.annotate(distance=F('routing__distance'))

        # compute emissions
        amount = ExpressionWrapper((F('amount') * F('distance') * F(indicator) / 10**6),
                                   output_field=FloatField())
        queryset = queryset.annotate(amount=amount)

        return queryset

    # def serialize(self, queryset, dimensions, format, anonymous):
    #     '''
    #     Serialize data into groups
    #     according to the requested dimensions
    #     '''
    #     data = []
    #
    #     # # EMISSIONS

    #     #
    #     # # aggregate emissions
    #     # total = queryset.values('emission')\
    #     #                 .aggregate(total=Sum('emission'))['total']/10**9
    #     # print(total)
    #
    #     # MAP
    #     # annotate amount from chains to flows
    #     queryset = queryset.annotate(amount=F('flowchain__amount'))
    #
    #     # annotate routing seq
    #     # exclude flows with no routing
    #     queryset = queryset.filter(routing__id__isnull=False) \
    #                        .annotate(sequence=F('routing__seq'))\
    #                        .values('sequence', 'amount')
    #
    #     # load ways with flows
    #     ways = {}
    #     for flow in queryset:
    #         seq, amount = flow['sequence'], flow['amount']
    #         if seq:
    #             seq = [int(id) for id in seq.split('@')]
    #             for id in seq:
    #                 if id in ways:
    #                     ways[id] += amount
    #                 else:
    #                     ways[id] = amount
    #
    #     # serialize network
    #     cursor = connections['routing'].cursor()
    #     cursor.execute("SELECT id, ST_AsText(the_geom) from ways")
    #     for way in cursor.fetchall():
    #         flow_item = []
    #         id, wkt = way
    #         flow_item.append(('id', id))
    #         if id in ways:
    #             flow_item.append(('amount', ways[id]))
    #         else:
    #             flow_item.append(('amount', 0))
    #         data.append(OrderedDict(flow_item))
    #     return data