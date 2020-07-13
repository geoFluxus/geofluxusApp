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
        amount = ExpressionWrapper((F('amount') * F('distance') * F(indicator) / 10**9),
                                   output_field=FloatField())
        queryset = queryset.annotate(amount=amount)

        return queryset