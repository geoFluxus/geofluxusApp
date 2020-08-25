from geofluxus.apps.analyse.views import MonitorViewSet
from django.db.models import (F, FloatField, Value,
                              ExpressionWrapper, OuterRef, Q)
from django.db.models.functions import Coalesce
from django.db import connections
from collections import OrderedDict
import json
from geofluxus.apps.asmfa.models import TreatmentEmission


class ImpactViewSet(MonitorViewSet):
    def annotate_amounts(self, queryset, indicator, impactSources, format):
        expression = Value(0) # default emissionvalue

        # annotate amount from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # transportation emissions
        if 'transportation' in impactSources:
            # based on vehicle, annotate emissions to flows
            queryset = queryset.annotate(transportation_emissions=Coalesce(F('vehicle__' + indicator), 0))

            # if network map, emission computed based on way length
            # indicator: grams per tonne kilometer
            # amount: tonnes
            # distance: meters -> kilometers
            expression += F('transportation_emissions') / 10**6 * F('amount')
            if format != 'networkmap':
                # annotate routing distance
                queryset = queryset.annotate(distance=Coalesce(F('routing__distance'), 0))
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
            queryset = queryset.annotate(treatment_emissions=Coalesce(subq.values(indicator), default))
            expression += F('treatment_emissions') / 10**6 * F('amount')

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