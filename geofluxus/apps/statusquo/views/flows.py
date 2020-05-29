from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         AdminLevel,
                                         Activity,
                                         Process,
                                         Waste04,
                                         Waste06,
                                         Actor)
from collections import OrderedDict
from django.db.models import (OuterRef, Subquery, F, Sum, Q, Case, When, IntegerField)


class StatusQuoViewSet(FilterFlowViewSet):
    def serialize(self, queryset, dimensions, format, anonymous):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # process dimensions for flow groups
        levels, fields = [], []  # levels: dimension granularity, fields: exact field to search

        # recover dimensions
        # TIME DIMENSION
        time = dimensions.pop('time', None)
        if time:
            levels.append(time.split('__')[-1])
            fields.append(time)

        # ECONOMIC DIMENSION
        eco = dimensions.pop('economicActivity', None)
        eco_inv ={}
        if eco:
            # create inventory to recover parent activitygroup
            level = eco.split('__')[-1]
            if level == 'activity':
                eco_inv = Activity.objects.values('id',
                                                  'activitygroup__id')
            levels.append(level)
            fields.append(eco)

        # TREATMENT DIMENSION
        treat = dimensions.pop('treatmentMethod', None)
        treat_inv = {}
        if treat:
            # create inventory to recover parent processgroup
            level = treat.split('__')[-1]
            if level == 'process':
                treat_inv = Process.objects.values('id',
                                                   'processgroup__id')
            levels.append(level)
            fields.append(treat)

        # MATERIAL DIMENSION
        mat = dimensions.pop('material', None)
        mat_inv = {}
        if mat:
            # create inventory to recover parent waste
            level = mat.split('__')[-1]
            if level == 'waste04':
                mat_inv = Waste04.objects.values('id',
                                                 'waste02__id')
            elif level == 'waste06':
                mat_inv = Waste06.objects.values('id',
                                                 'waste04__id',
                                                 'waste04__waste02__id')
            levels.append(level)
            fields.append(mat)

        # SPACE DIMENSION
        space = dimensions.pop('space', None)
        space_inv = {}
        if space:
            # annotate spatial info to flows
            if format == 'flowmap':
                queryset, level, field = self.format_flows(queryset, space)
                levels.extend(level)
                fields.extend(field)
                level = level[0]
            else:
                queryset, level, field = self.format_space(queryset, space)
                levels.append(level)
                fields.append(field)

            # create inventory to recover actors
            if 'actor' in level:
                if isinstance(field, list):
                    actors = list()
                    for f in field:
                        ext = list(queryset.values_list(f, flat=True).distinct())
                        actors.extend(ext)
                else:
                    actors = queryset.values_list(field, flat=True).distinct()
                space_inv = Actor.objects.filter(id__in=actors)\
                                         .values('id',
                                                 'company__name',
                                                 'geom')
            elif 'area' in level:
                space_inv = Area.objects.values('id',
                                                'name',
                                                'geom')

        if format == "parallelsets" and len(fields) == 1:
            field = fields[0].replace('origin__', '')\
                             .replace('destination__', '')
            level = field.split('__')[-1]
            levels, fields = [], []
            levels.extend([level, level])
            fields.extend(['origin__' + field,
                           'destination__' + field])

        # workaround Django ORM bug
        # queryset = queryset.order_by()

        # aggregate flows into groups
        # groups = queryset.values(*fields).distinct()
        groups = queryset.values(*fields)\
                         .order_by(*fields)\
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
            for level, field in zip(levels, fields):
                # format parent / special fields
                if 'actor' in level:
                    actor = next(x for x in space_inv if x['id'] == group[field])
                    if format == 'flowmap':
                        item = {}
                        item['id'] = actor['id']
                        item['name'] = 'company ' + str(random.randint(1, 10**6)) if anonymous else actor['company__name']
                        item['lon'] = actor['geom'].x + random.randint(0, 10) * 0.01 if anonymous \
                                      else actor['geom'].x
                        item['lat'] = actor['geom'].y + random.randint(0, 10) * 0.01 if anonymous \
                                      else actor['geom'].y
                        label = level.split('_')[0]
                        flow_item.append((label, item))
                    else:
                        if anonymous:
                            flow_item.append(('actorId', actor['id']))
                            flow_item.append(('actorName', 'company ' + str(random.randint(1, 10**6))))
                            flow_item.append(('lon', actor['geom'].x + random.randint(0, 10) * 0.01))
                            flow_item.append(('lat', actor['geom'].y + random.randint(0, 10) * 0.01))
                        else:
                            flow_item.append(('actorId', actor['id']))
                            flow_item.append(('actorName', actor['company__name']))
                            flow_item.append(('lon', actor['geom'].x))
                            flow_item.append(('lat', actor['geom'].y))
                    continue
                elif 'area' in level:
                    area = next(x for x in space_inv if x['id'] == group[field])
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
                    activity = next(x for x in eco_inv if x['id'] == group[field])
                    flow_item.append(('activitygroup', activity['activitygroup__id']))
                elif level == 'process' and format != "parallelsets":
                    process = next(x for x in treat_inv if x['id'] == group[field])
                    flow_item.append(('processgroup', process['processgroup__id']))
                elif 'waste' in level and format != "parallelsets":
                    if level == 'waste04':
                        waste04 = next(x for x in mat_inv if x['id'] == group[field])
                        flow_item.append(('waste02', waste04['waste02__id']))
                    elif level == 'waste06':
                        waste06 = next(x for x in mat_inv if x['id'] == group[field])
                        flow_item.append(('waste04', waste06['waste04__id']))
                        flow_item.append(('waste02', waste06['waste04__waste02__id']))

                # format field
                if format == 'parallelsets':
                    if 'waste' in field:
                        if any('origin' in f for f in fields):
                            flow_item.append(('destination', {level: group[field]}))
                        elif any('destination' in f for f in fields):
                            flow_item.append(('origin', {level: group[field]}))
                        continue
                    label = field.split('__')[0]
                    flow_item.append((label, {level: group[field]}))
                else:
                    flow_item.append((level, group[field]))
                    
            data.append(OrderedDict(flow_item))

        return data

    @staticmethod
    def format_flows(queryset, space):
        # recover all areas of the selected
        # administrative level
        id = space.pop('adminlevel', None)
        if id:
            areas = Area.objects.filter(adminlevel=id)
            admin = AdminLevel.objects.filter(id=id)[0].level

            # Actor level is the only one
            # with no areas!
            if areas.count() != 0:
                # annotate origin / destination areas
                # exclude origins / destinations with LOWER admin level!
                filter = 'area__adminlevel__level__lt'
                queryset = queryset.exclude(Q(**{('origin__' + filter): admin}) |\
                                            Q(**{('destination__' + filter): admin}))

                queryset = queryset.annotate(
                    origin_area=Case(
                        When(origin__area__adminlevel__level=admin, then=F('origin__area')),
                        When(origin__area__parent_area__adminlevel__level=admin, then=F('origin__area__parent_area')),
                        When(origin__area__parent_area__parent_area__adminlevel__level=admin, then=F('origin__area__parent_area__parent_area')),
                        output_field=IntegerField()
                    ),
                    destination_area=Case(
                        When(destination__area__adminlevel__level=admin, then=F('destination__area')),
                        When(destination__area__parent_area__adminlevel__level=admin, then=F('destination__area__parent_area')),
                        When(destination__area__parent_area__parent_area__adminlevel__level=admin,
                             then=F('destination__area__parent_area__parent_area')),
                        output_field=IntegerField()
                    )
                )

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

    @staticmethod
    def format_space(queryset, space):
        # recover all areas of the selected
        # administrative level
        adminlevel = space.pop('adminlevel', None)
        if adminlevel:
            areas = Area.objects.filter(adminlevel=adminlevel)

            # attach to flows the area
            # to which their origin / destination belongs
            field = space.pop('field', None)
            if field:
                # Actor level is the only one
                # with no areas!
                if areas.count() != 0:
                    # recover the area id to which
                    # the flow origin / destination belongs
                    subq = areas.filter(geom__contains=OuterRef(field))

                    # annotate to area id to flows
                    queryset = queryset.annotate(area=Subquery(subq.values('id')))

                    # append to other dimensions
                    level = 'area'
                    field = 'area'
                else:
                    # annotate origin / destination id
                    field = field.split('__')[0] + '__id'
                    queryset = queryset.annotate(actor=F(field))

                    # append to other dimensions
                    level = 'actor'
                    field = 'actor'
        return queryset, level, field