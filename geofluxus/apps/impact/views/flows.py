from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Routing, Ways)
from collections import OrderedDict
from django.db.models import (Q, OuterRef, Subquery, F)
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

        # annotate routing sequence
        routings = Routing.objects
        subq = routings.filter(Q(origin=OuterRef('origin')) & \
                               Q(destination=OuterRef('destination')))
        queryset = queryset.annotate(sequence=Subquery(subq.values('seq')))

        # load ways with flows
        ways = {}
        for flow in queryset:
            seq, amount = flow.sequence, flow.amount
            if seq:
                seq = [int(id) for id in seq.split('@')]
                for id in seq:
                    if id in ways:
                        ways[id] += amount
                    else:
                        ways[id] = amount

        # serialize network
        cursor = connections['routing'].cursor()
        cursor.execute("SELECT id, ST_AsText(the_geom) from ways")
        for way in cursor.fetchall():
            flow_item = []
            id, wkt = way
            flow_item.append(('id', id))
            if id in ways:
                flow_item.append(('amount', ways[id]))
            else:
                flow_item.append(('amount', 0))
            data.append(OrderedDict(flow_item))
        return data