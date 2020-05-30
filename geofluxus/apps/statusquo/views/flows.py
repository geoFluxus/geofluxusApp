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


class StatusQuoViewSet(FilterFlowViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.levels = []  # fields: exact field to search
        self.fields = []  # levels: dimension granularity
        self.space_inv = {}  # space dimension inventory
        self.eco_inv = {}  # eco dimension inventory
        self.treat_inv = {}  # treat dimension inventory
        self.mat_inv = {}  # material dimension inventory

    def serialize(self, queryset, dimensions, format, anonymous):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

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
                # format parent / special fields
                if 'actor' in level:
                    actor = next(x for x in self.space_inv if x['id'] == group[field])
                    if format == 'flowmap':
                        item = {}
                        item['id'] = actor['id']
                        item['name'] = 'company ' + str(random.randint(1, 10 ** 6)) if anonymous else actor[
                            'company__name']
                        item['lon'] = actor['geom'].x + random.randint(0, 10) * 0.01 if anonymous \
                            else actor['geom'].x
                        item['lat'] = actor['geom'].y + random.randint(0, 10) * 0.01 if anonymous \
                            else actor['geom'].y
                        label = level.split('_')[0]
                        flow_item.append((label, item))
                    else:
                        if anonymous:
                            flow_item.append(('actorId', actor['id']))
                            flow_item.append(('actorName', 'company ' + str(random.randint(1, 10 ** 6))))
                            flow_item.append(('lon', actor['geom'].x + random.randint(0, 10) * 0.01))
                            flow_item.append(('lat', actor['geom'].y + random.randint(0, 10) * 0.01))
                        else:
                            flow_item.append(('actorId', actor['id']))
                            flow_item.append(('actorName', actor['company__name']))
                            flow_item.append(('lon', actor['geom'].x))
                            flow_item.append(('lat', actor['geom'].y))
                    continue
                elif 'area' in level:
                    area = next(x for x in self.space_inv if x['id'] == group[field])
                    if format == 'flowmap':
                        item = {}
                        item['id'] = area['id']
                        item['name'] = area['name']
                        item['lon'] = area['geom'].centroid.x
                        item['lat'] = area['geom'].centroid.y
                        label = level.split('_')[0]
                        flow_item.append((label, item))
                    else:
                        flow_item.append(('areaId', area['id']))
                        flow_item.append(('areaName', area['name']))
                    continue
                elif level == 'activity' and format != 'parallelsets':
                    activity = next(x for x in self.eco_inv if x['id'] == group[field])
                    flow_item.append(('activitygroup', activity['activitygroup__id']))
                elif level == 'process' and format != "parallelsets":
                    process = next(x for x in self.treat_inv if x['id'] == group[field])
                    flow_item.append(('processgroup', process['processgroup__id']))
                elif 'waste' in level and format != "parallelsets":
                    if level == 'waste04':
                        waste04 = next(x for x in self.mat_inv if x['id'] == group[field])
                        flow_item.append(('waste02', waste04['waste02__id']))
                    elif level == 'waste06':
                        waste06 = next(x for x in self.mat_inv if x['id'] == group[field])
                        flow_item.append(('waste04', waste06['waste04__id']))
                        flow_item.append(('waste02', waste06['waste04__waste02__id']))

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
        # TIME DIMENSION
        time = dimensions.pop('time', None)
        if time:
            self.levels.append(time.split('__')[-1])
            self.fields.append(time)

        # ECONOMIC DIMENSION
        eco = dimensions.pop('economicActivity', None)
        if eco:
            # create inventory to recover parent activitygroup
            level = eco.split('__')[-1]
            if level == 'activity':
                self.eco_inv = Activity.objects.values('id',
                                                       'activitygroup__id')
            self.levels.append(level)
            self.fields.append(eco)

        # TREATMENT DIMENSION
        treat = dimensions.pop('treatmentMethod', None)
        if treat:
            # create inventory to recover parent processgroup
            level = treat.split('__')[-1]
            if level == 'process':
                self.treat_inv = Process.objects.values('id',
                                                        'processgroup__id')
            self.levels.append(level)
            self.fields.append(treat)

        # MATERIAL DIMENSION
        mat = dimensions.pop('material', None)
        if mat:
            # create inventory to recover parent waste
            level = mat.split('__')[-1]
            if level == 'waste04':
                self.mat_inv = Waste04.objects.values('id',
                                                      'waste02__id')
            elif level == 'waste06':
                self.mat_inv = Waste06.objects.values('id',
                                                      'waste04__id',
                                                      'waste04__waste02__id')
            self.levels.append(level)
            self.fields.append(mat)

        # SPACE DIMENSION
        space = dimensions.pop('space', None)
        if space:
            # annotate spatial info to flows
            if format == 'flowmap':
                queryset = self.format_flows(queryset, space)
            else:
                queryset = self.format_space(queryset, space)

            # create inventory to recover actors
            if 'actor' in level:
                if isinstance(field, list):
                    actors = list()
                    for f in field:
                        extra = list(queryset.values_list(f, flat=True).distinct())
                        actors.extend(extra)
                else:
                    actors = queryset.values_list(field, flat=True).distinct()
                self.space_inv = Actor.objects.filter(id__in=actors) \
                                              .values('id',
                                                      'company__name',
                                                      'geom')
            elif 'area' in level:
                self.space_inv = Area.objects.values('id',
                                                     'name',
                                                     'geom')

        if format == "parallelsets" and len(self.fields) == 1:
            field = self.fields[0].replace('origin__', '') \
                                  .replace('destination__', '')
            level = field.split('__')[-1]
            self.levels, self.fields = [], []
            self.levels.extend([level, level])
            self.fields.extend(['origin__' + field,
                                'destination__' + field])

        return queryset


    @staticmethod
    def format_flows(queryset, space):
        # recover all areas of the selected
        # administrative level
        id = space.pop('adminlevel', None)
        if id:
            admin = AdminLevel.objects.filter(id=id)[0].level

            # Actor level is the only one
            # with no areas!
            if admin != 1000:
                # exclude origins / destinations with LOWER admin level!
                search = 'adminlevel__level'
                queryset = queryset.exclude(Q(**{('origin__area__' + search + '__lt'): admin}) |\
                                            Q(**{('destination__area__' + search + '__lt'): admin}))

                # annotate origin / destination areas
                total = AdminLevel.objects.exclude(level=1000).count()
                for node in ['origin__area', 'destination__area']:
                    cases = []
                    steps = total - admin  # steps to move in admin hierarchy

                    while steps >= 0:
                        func = node + '__' + 'parent_area__' * steps
                        case = When(**{(func + search): admin}, then=F(func[:-2]))
                        cases.append(case)
                        steps -= 1

                    node = node.replace('__', '_')
                    queryset = queryset.annotate(**{node: Case(*cases, output_field=IntegerField())})

                # append to other dimensions
                level = ['origin_area', 'destination_area']
                field = ['origin_area', 'destination_area']
            else:
                # annotate origin / destination actor
                queryset = queryset.annotate(origin_actor=F('origin'),
                                             destination_actor=F('destination'))

                # append to other dimensions
                level = ['origin_actor', 'destination_actor']
                field = ['origin_actor', 'destination_actor']
        return queryset, level, field

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