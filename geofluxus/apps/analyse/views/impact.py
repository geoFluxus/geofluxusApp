from geofluxus.apps.analyse.views import MonitorViewSet
from django.db.models import (F, FloatField, Value,
                              ExpressionWrapper, OuterRef, Q, Sum)
from django.db.models.functions import Coalesce
from django.db import connections
from collections import OrderedDict
import json
from geofluxus.apps.asmfa.models import TreatmentEmission, FlowChain, Flow


class ImpactViewSet(MonitorViewSet):
    def annotate_amounts(self, queryset, indicator, impactSources, format):
        # retrieve chains from filtered flows
        chains = queryset.values_list('flowchain', flat=True)
        flows = Flow.objects.filter(flowchain__id__in=chains)

        expression = Value(0) # default emissionvalue

        # annotate amount from chains to flows
        flows = flows.annotate(amount=F('flowchain__amount'))

        # transportation emissions
        if 'transportation' in impactSources:
            # based on vehicle, annotate emissions to flows
            flows = flows.annotate(transportation_emissions=Coalesce(F('vehicle__' + indicator), 0))

            # if network map, emission computed based on way length
            # indicator: grams per tonne kilometer
            # amount: tonnes
            # distance: meters -> kilometers
            expression += F('transportation_emissions') / 10**6 * F('amount')
            if format != 'networkmap':
                # annotate routing distance
                flows = flows.annotate(distance=Coalesce(F('routing__distance'), 0))
                expression *= F('distance') / 10**3

        # waste treatment emissions
        if 'treatment' in impactSources:
            # retrieve treatment emissions
            # filter on waste and destination processgroup!
            treatment_emissions = TreatmentEmission.objects
            subq = treatment_emissions.filter(Q(processgroup=OuterRef('destination__process__processgroup')) &\
                                              Q(waste06=OuterRef('flowchain__waste06')))

            # indicator: grams per tonne
            # amount: tonnes
            # if not emissions for waste, check processgroup alone
            default = Coalesce(F('destination__process__processgroup__' + indicator), 0)
            flows = flows.annotate(treatment_emissions=Coalesce(subq.values(indicator), default))
            expression += F('treatment_emissions') / 10**6 * F('amount')

        # # update amounts
        # amount = ExpressionWrapper(expression, output_field=FloatField())
        # flows = flows.annotate(amount=amount)
        # # group flows by chain
        # groups = flows.values('flowchain') \
        #               .order_by('flowchain') \
        #               .annotate(total=Sum('amount'))
        # # annotate chain totals to original flows
        # subq = groups.filter(flowchain=OuterRef('flowchain'))
        # queryset = queryset.annotate(amount=subq.values('total'))

        f = open('/home/geofluxus/Desktop/data.csv', 'w')
        f.write('id;processes;trips\n')
        from django.contrib.postgres.aggregates import StringAgg
        from django.db.models.functions import Cast
        from django.db.models import CharField
        groups = flows.values('flowchain') \
                      .order_by('flowchain') \
                      .annotate(amounts=StringAgg(Cast('amount', output_field=CharField()), delimiter=";"),
                                processes=StringAgg('destination__process__name', delimiter=";"))
        subq = groups.filter(flowchain=OuterRef('flowchain'))
        queryset = queryset.values('origin__id')\
                           .order_by('origin__id')\
                           .annotate(total=Sum('flowchain__amount'),
                                     amounts=StringAgg(subq.values('amounts'), delimiter=";"),
                                     processes=StringAgg(subq.values('processes'), delimiter=";"),
                                     trips=Sum('flowchain__trips'))
        for item in queryset.values('origin__id',
                                    'total',
                                    'amounts',
                                    'processes',
                                    'trips'):
            amounts = [float(o) for o in item['amounts'].split(';')]
            processes = item['processes'].split(';')
            inv = {}
            for process, amount in zip(processes, amounts):
                if process == 'Unknown': continue
                if process in inv:
                    inv[process] += amount
                else:
                    inv[process] = amount
            for key, value in inv.items():
                inv[key] = round(value / float(item['total']) * 100, 2)
            line = '{};{};{}\n'.format(item['origin__id'],
                                       inv,
                                       item['trips'])
            f.write(line)
        f.close()

        return queryset

    def serialize_network(self, ways):
        data = []

        # fetch network (with distances)
        cursor = connections['routing'].cursor()
        query = '''
                SELECT id,
                       ST_AsGeoJSON(the_geom),
                       ST_LengthSpheroid(the_geom,
                                         'SPHEROID["GRS_1980",6378137,298.257222101]')
                FROM ways
                '''
        cursor.execute(query)

        # serialize
        for way in cursor.fetchall():
            id, geometry, distance = way
            if id not in ways: ways[id] = 0

            flow_item = [('id', id),
                         ('geometry', json.loads(geometry)),
                         ('amount', ways[id] * distance / 10**3)]
            data.append(OrderedDict(flow_item))

        return data