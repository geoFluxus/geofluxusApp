from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         AdminLevel,
                                         Activity,
                                         Process,
                                         Waste04,
                                         Waste06,
                                         Actor)
from collections import OrderedDict
from django.db.models import (F, Sum, Q, Case, When, IntegerField)


DIMS = {
    # name: levels
    'time':             ['month', 'year'],
    'economicActivity': ['activity', 'activitygroup'],
    'treatmentMethod':  ['process', 'processgroup'],
    'material':         ['waste06', 'waste04', 'waste02']
}

MODELS = {
    'activity': Activity,
    'process':  Process,
    'waste04':  Waste04,
    'waste06':  Waste06
}

INV = {}


class MonitorViewSet(FilterFlowViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.levels = []     # dimension granularity
        self.fields = []     # exact field to search

    def annotate_amounts(self, queryset, indicator, impactSources):
        queryset = queryset.annotate(amount=F('flowchain__amount'))
        return queryset

    def serialize(self, queryset,
                  dimensions, format, anonymous,
                  indicator, impactSources):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = self.annotate_amounts(queryset, indicator, impactSources)

        # process dimensions for flow groups
        queryset = self.process_dimensions(queryset, dimensions, format)

        # workaround Django ORM bug
        # queryset = queryset.order_by()

        # aggregate flows into groups
        # groups = queryset.values(*fields).distinct()
        groups = queryset.values(*self.fields) \
                         .order_by(*self.fields) \
                         .annotate(total=Sum('amount'))

        # serialize aggregated flow groups
        import random
        for group in groups:
            # check for groups fields with null values!
            # these groups should be excluded entirely
            has_null = False
            for field, value in group.items():
                if not value:
                    has_null = True
                    break
            if has_null: continue

            # remove flows with same origin / destination
            if format == 'flowmap':
                if 'origin_area' in group and \
                   'destination_area' in group:
                    origin = group['origin_area']
                    destination = group['destination_area']
                    if origin == destination: continue

            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group['total'])]
            for level, field in zip(self.levels, self.fields):
                if any(l in level for l in ['actor', 'area']):
                    area = next(x for x in self.space_inv if x['id'] == group[field])

                    item = {}
                    item['id'] = area['id']
                    item['name'] = area['name'] if 'area' in level else area['company__name']
                    item['lon'] = area['geom'].centroid.x if 'area' in level else area['geom'].x
                    item['lat'] = area['geom'].centroid.y if 'area' in level else area['geom'].y

                    if anonymous:
                        item['name'] = 'company ' + str(random.randint(1, 10**6))
                        item['lon'] += random.randint(0, 10) * 0.01
                        item['lat'] += random.randint(0, 10) * 0.01

                    if format == 'flowmap':
                        label = level.split('_')[0]
                        flow_item.append((label, item))
                    else:
                        label = level.split('_')[-1]
                        for key, value in item.items():
                            flow_item.append((label + key.capitalize(), value))
                    continue

                if format != 'parallelsets' and level in INV.keys():
                    item = next(x for x in INV[level] if x['id'] == group[field])
                    for key, value in item.items():
                        if key != 'id':
                            label = key.split('__')[-2]
                            flow_item.append((label, item[key]))

                # format field
                if format == 'parallelsets':
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

        return data

    def process_dimensions(self, queryset, dimensions, format):
        # recover dimensions
        for dim in DIMS.keys():
            # check if dimension is requested by field
            field = dimensions.pop(dim, None)
            if field:
                level = field.split('__')[-1]   # the requested level
                levels = DIMS[dim]              # all dimension levels

                # hierarchical search
                if level in MODELS.keys():
                    parents = levels[levels.index(level) + 1:]
                    values = []
                    for i in range(len(parents)):
                        values.append('__'.join(parents[:i+1]) + '__id')
                    INV[level] = MODELS[level].objects.values('id', *values)

                # append
                self.levels.append(level)
                self.fields.append(field)

        # SPACE DIMENSION
        space = dimensions.pop('space', None)
        if space:
            # annotate spatial info to flows
            both = True if format == 'flowmap' else False
            queryset = self.format_space(queryset, space, both)

            # create inventory to recover actors / areas
            # check the last level added!
            if 'actor' in self.levels[-1]:
                if both:
                    actors = list()
                    for field in self.levels[-2:]:
                        extra = list(queryset.values_list(field, flat=True).distinct())
                        actors.extend(extra)
                else:
                    actors = queryset.values_list(self.levels[-1], flat=True).distinct()
                self.space_inv = Actor.objects.filter(id__in=actors)\
                                              .values('id',
                                                      'company__name',
                                                      'geom')
            elif 'area' in self.levels[-1]:
                self.space_inv = Area.objects.values('id',
                                                     'name',
                                                     'geom')

        # parallel sets for treatment method (group)
        if format == "parallelsets" and len(self.fields) == 1:
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
            admin = AdminLevel.objects.filter(id=id)[0].level

            # check if both origin & destination are needed
            if not both:
                fields = [space.pop('field', None)]
            else:
                fields = ['origin', 'destination']

            # attach to flows the area
            # to which their origin / destination belongs
            for field in fields:
                # Actor level is the only one
                # with no areas!
                if admin != 1000:
                    field += '__area'

                    # exclude origins / destinations with LOWER admin level!
                    search = '__adminlevel__level'
                    queryset = queryset.exclude(Q(**{(field + search + '__lt'): admin}))

                    # annotate origin / destination areas
                    total = AdminLevel.objects.exclude(level=1000).count()
                    cases = []
                    steps = total - admin  # steps to move in admin hierarchy

                    while steps >= 0:
                        func = field + '__parent_area' * steps
                        case = When(**{(func + search): admin}, then=F(func))
                        cases.append(case)
                        steps -= 1

                    field = field.replace('__', '_')
                    queryset = queryset.annotate(**{field: Case(*cases, output_field=IntegerField())})
                else:
                    # annotate origin / destination id
                    queryset = queryset.annotate(**{(field + '_actor'): F(field + '_id')})
                    field += '_actor'

                # append to other dimensions
                self.fields.append(field)
                self.levels.append(field)

        return queryset