from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         AdminLevel,
                                         Month,
                                         Activity,
                                         Process,
                                         Waste04,
                                         Waste06,
                                         Actor)
from collections import OrderedDict
from django.db.models import (F, Sum, Q, Case, When, IntegerField)
from django.db import connections
import json


DIMS = {
    # name: levels
    'time':             ['month', 'year'],
    'economicActivity': ['activity', 'activitygroup'],
    'treatmentMethod':  ['process', 'processgroup'],
    'material':         ['waste06', 'waste04', 'waste02']
}

MODELS = {
    'month': Month,
    'activity': Activity,
    'process':  Process,
    'waste04':  Waste04,
    'waste06':  Waste06
}

INV = {}

ACTOR_LEVEL = 1000


class MonitorViewSet(FilterFlowViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.levels = []     # dimension granularity
        self.fields = []     # exact field to search
        self.admin = None    # admin level for areas

    def annotate_amounts(self, queryset, indicator, impactSources, format):
        queryset = queryset.annotate(amount=F('flowchain__amount'))
        return queryset

    def process_network(self, queryset):
        # annotate routing seq
        # exclude flows with no routing
        queryset = queryset.annotate(sequence=F('routing__seq'))\
                           .values('sequence', 'amount')

        # load ways with flows
        ways = {}
        for flow in queryset:
            seq, amount = flow['sequence'], flow['amount']
            if not amount: amount = 0
            if seq:
                seq = [int(id) for id in seq.split('@')]
                for id in seq:
                    if id in ways:
                        ways[id] += amount
                    else:
                        ways[id] = amount

        return self.serialize_network(ways)

    def serialize_network(self, ways):
        data = []

        # fetch network (without distances)
        cursor = connections['routing'].cursor()
        query = '''
                SELECT id,
                       ST_AsGeoJSON(the_geom)
                FROM ways
                '''
        cursor.execute(query)

        # serialize
        for way in cursor.fetchall():
            id, geometry = way
            if id not in ways: ways[id] = 0

            flow_item = [('id', id),
                         ('geometry', json.loads(geometry)),
                         ('amount', ways[id])]
            data.append(OrderedDict(flow_item))

        return data

    def serialize(self, queryset,
                  dimensions, format, anonymous,
                  indicator, impactSources):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = self.annotate_amounts(queryset, indicator, impactSources, format)

        # process for network map
        if format == 'networkmap':
            return self.process_network(queryset)

        # process dimensions for flow groups
        queryset = self.process_dimensions(queryset, dimensions, format)

        # workaround Django ORM bug
        # queryset = queryset.order_by()

        # aggregate flows into groups
        # groups = queryset.values(*fields).distinct()
        groups = queryset.values(*self.fields) \
                         .order_by(*self.fields) \
                         .annotate(total=Sum('amount'))

        # check for groups fields with null values!
        # these groups should be excluded entirely
        queries = {
            'total__isnull': False,
            'total__gt': 0
        }
        for field in self.fields:
            queries[field + '__isnull'] = False
        groups = groups.filter(**queries)

        # remove flows with same origin / destination
        if 'origin_area' in self.fields and \
           'destination_area' in self.fields:
            groups = groups.exclude(origin_area=F('destination_area'))

        # complete area inventory after aggregating flows
        area_ids = set()
        if self.admin and self.admin.level != ACTOR_LEVEL:
            # collect area ids for flow origin or/and destination
            for field in self.fields:
                if field in ['origin_area', 'destination_area']:
                    area_ids.update(list(groups.filter(**{field + '__isnull': False})
                                               .values_list(field, flat=True)
                                               .distinct()))
            # complete inventory for collected areas
            if area_ids:
                self.space_inv = self.space_inv.filter(id__in=area_ids)\
                                               .values('id',
                                                       'name',
                                                       'geom',
                                                       'adminlevel')

        # serialize aggregated flow groups
        import random
        for group in groups:
            # # check for groups fields with null values!
            # # these groups should be excluded entirely
            # if any(not value for value in group.values()): continue

            # # remove flows with same origin / destination
            # if group.get('origin_area', True) == group.get('destination_area', False): continue

            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group['total'])]
            for level, field in zip(self.levels, self.fields):
                # serialize space dimension fields
                if any(l in level for l in ['actor', 'area']):
                    area = next(x for x in self.space_inv if x['id'] == group[field])

                    item = {
                        'id': area['id'], 'name': area['name'] if 'area' in level else area['company__name'],
                        'lon': area['geom'].centroid.x if 'area' in level else area['geom'].x,
                        'lat': area['geom'].centroid.y if 'area' in level else area['geom'].y
                    }

                    # anonymize actor fields for demo mode
                    if anonymous and 'actor' in level:
                        item['name'] = 'company ' + str(random.randint(1, 10**6))
                        item['lon'] += random.randint(0, 10) * 0.01
                        item['lat'] += random.randint(0, 10) * 0.01

                    # change format for flowmap (both origin/destination)
                    if format in ['flowmap', 'arclayer']:
                        label = level.split('_')[0]
                        flow_item.append((label, item))
                    else:
                        label = level.split('_')[-1]
                        for key, value in item.items():
                            flow_item.append((label + key.capitalize(), value))
                    continue

                # recover parent fields (if necessary)
                # not required for parallel sets
                if format not in ['parallelsets', 'circularsankey'] and level in INV.keys():
                    item = next(x for x in INV[level] if x['id'] == group[field])
                    for key, value in item.items():
                        if key != 'id':
                            label = key.split('__')[-2]
                            flow_item.append((label, item[key]))

                # format field
                if format in ['parallelsets', 'circularsankey']:
                    # for parallel sets
                    # determine if material dimension is origin or destination
                    if 'waste' in field:
                        if any('origin' in f for f in self.fields):
                            flow_item.append(('destination', {level: group[field]}))
                        elif any('destination' in f for f in self.fields):
                            flow_item.append(('origin', {level: group[field]}))
                        continue
                    label = field.split('__')[0]
                    flow_item.append((label, {level: group[field]}))
                else:
                    flow_item.append((level, group[field]))

            data.append(OrderedDict(flow_item))

        # serialize areas for visualizations
        if data and format in ['choroplethmap', 'flowmap']:
            areas = []
            for id in area_ids:
                # check for area in space inventory
                area = next(x for x in self.space_inv if x['id'] == id)

                # serialize only areas of requested admin level!!!
                if area['adminlevel'] == self.admin.id:
                    # simplify geometry to render
                    geom = area['geom'].simplify(tolerance=self.admin.resolution,
                                                 preserve_topology=False)

                    # serialize area
                    area_item = {
                        'id': area['id'],
                        'name': area['name'],
                        'geom': json.loads(geom.geojson)
                    }

                    # attention! convert all geometries to common type MULTIPOLYGON
                    if area_item['geom']['type'] == 'Polygon':
                        area_item['geom']['type'] = 'MultiPolygon'
                        area_item['geom']['coordinates'] = [area_item['geom']['coordinates']]

                    areas.append(area_item)

            if areas: data.append(areas)

        return data

    def process_dimensions(self, queryset, dimensions, format):
        # recover dimensions
        for dim in DIMS.keys():
            # check if dimension is requested by field
            field = dimensions.pop(dim, None)
            if field:
                level = field.split('__')[-1]   # the requested level
                levels = DIMS[dim]              # all dimension levels

                # hierarchical search for requested level
                if level in MODELS.keys():
                    parents = levels[levels.index(level) + 1:] # recover all parent levels
                    values = []  # hierarchical search in Django (child__parent)
                    for i in range(len(parents)):
                        values.append('__'.join(parents[:i+1]) + '__id')

                    # create inventory to search ids during serialization
                    INV[level] = MODELS[level].objects.values('id', *values)

                # append
                self.levels.append(level)
                self.fields.append(field)

        # SPACE DIMENSION
        space = dimensions.pop('space', None)
        if space:
            # annotate spatial info to flows
            both = format in ['flowmap', 'arclayer']
            queryset = self.format_space(queryset, space, both)

            # create inventory to recover actors / areas
            # check the last level added!
            if 'actor' in self.levels[-1]:
                # recover actor info for both origin / destination
                if both:
                    actors = list()
                    for field in self.levels[-2:]:
                        extra = list(queryset.values_list(field, flat=True).distinct())
                        actors.extend(extra)
                # recover actor info either for origin or destination
                else:
                    actors = queryset.values_list(self.levels[-1], flat=True).distinct()
                self.space_inv = Actor.objects.filter(id__in=actors)\
                                              .values('id',
                                                      'company__name',
                                                      'geom')
            elif 'area' in self.levels[-1]:
                # complete area inventory after aggregating flows
                self.space_inv = Area.objects

        # parallel sets for treatment method (group)
        if format in ['parallelsets', 'circularsankey'] and len(self.fields) == 1:
            field = self.fields[0].replace('origin__', '') \
                                  .replace('destination__', '')
            level = field.split('__')[-1]
            self.levels, self.fields = [], []
            self.levels.extend([level, level])
            self.fields.extend(['origin__' + field,
                                'destination__' + field])

        return queryset

    def format_space(self, queryset, space, both=False):
        # recover administrative level
        id = space.pop('adminlevel', None)
        if id:
            self.admin = AdminLevel.objects.filter(id=id)[0]
            admin = self.admin.level

            # check if both origin & destination are needed
            fields = ['origin', 'destination'] if both else [space.pop('field', None)]

            # attach to flows the area
            # to which their origin / destination belongs
            for field in fields:
                # Actor level is the only one
                # with no areas!
                if admin != ACTOR_LEVEL:
                    field += '__area'

                    # exclude origins / destinations with LOWER admin level!
                    search = '__adminlevel__level'
                    # queryset = queryset.exclude(Q(**{(field + search + '__lt'): admin}))

                    # annotate origin / destination areas
                    total = AdminLevel.objects.exclude(level=ACTOR_LEVEL).count()
                    cases = []
                    steps = total - admin  # steps to move in admin hierarchy

                    while steps >= 0:
                        func = field + '__parent_area' * steps
                        case = When(**{(func + search): admin}, then=F(func))
                        cases.append(case)
                        steps -= 1

                    default = field  # set original origin/destination area as default value
                    field = field.replace('__', '_')
                    queryset = queryset.annotate(**{field: Case(*cases,
                                                                output_field=IntegerField(),
                                                                default=F(default))})
                else:
                    # annotate origin / destination id
                    queryset = queryset.annotate(**{(field + '_actor'): F(field + '_id')})
                    field += '_actor'

                # append to other dimensions
                self.fields.append(field)
                self.levels.append(field)

            # for areas, filter queryset to contain
            # only flows with origin / destination in selected admin level
            if admin != ACTOR_LEVEL:
                # find all areas of selected admin level
                ids = Area.objects.filter(adminlevel=id)\
                                  .values_list('id', flat=True)
                # either origin / destination should belong to that level
                if both:
                    queryset = queryset.filter(Q(origin_area__in=ids) |\
                                               Q(destination_area__in=ids))
                else:
                    queryset = queryset.filter(**{(field + '__in'): ids})

        return queryset