from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         Actor,
                                         Waste04,
                                         Waste06)
from collections import OrderedDict
from django.db.models import (OuterRef, Subquery, F)
from django.db import connections


class ImpactViewSet(FilterFlowViewSet):
    def serialize(self, queryset, dimensions, format):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # retrieve road network
        cursor = connections['routing'].cursor()
        print(cursor)

        return data