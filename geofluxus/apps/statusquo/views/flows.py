from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         Activity,
                                         Process,
                                         Waste04,
                                         Waste06,
                                         Actor)
from collections import OrderedDict
from django.db.models import (OuterRef, Subquery, F, Sum)


class StatusQuoViewSet(FilterFlowViewSet):
    def serialize(self, queryset, dimensions, format):
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
            # if format == 'flowmap':
            #     queryset, levels, fields = self.format_flows(space, queryset,
            #                                                  levels, fields)
            # else:
            queryset, level, field = self.format_space(queryset, space)
            if level == 'actor':
                space_inv = Actor.objects.values('id',
                                                 'company__name',
                                                 'geom')
            levels.append(level)
            fields.append(field)

        # workaround Django ORM bug
        # queryset = queryset.order_by()

        # aggregate flows into groups
        # groups = queryset.values(*fields).distinct()
        groups = queryset.values(*fields)\
                         .order_by(*fields)\
                         .annotate(total=Sum('amount'))

        # serialize aggregated flow groups
        for group in groups:
            # check for groups fields with null values!
            # these groups should be excluded entirely
            has_null = False
            for field, value in group.items():
                if not value:
                    has_null = True
                    break
            if has_null: continue

            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group['total'])]
            for level, field in zip(levels, fields):
                # format parent fields
                if level == 'actor':
                    actor = next(x for x in space_inv if x['id'] == group[field])
                    flow_item.append(('actorId', actor['id']))
                    flow_item.append(('actorName', actor['company__name']))
                    flow_item.append(('lon', actor['geom'].x))
                    flow_item.append(('lat', actor['geom'].y))
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
                    label = field.split('__')[0]
                    flow_item.append((label, {level: group[field]}))
                else:
                    flow_item.append((level, group[field]))
            #     # if 'actor' in field:
            #     #     actor = actors[group[field]]
            #     #     flow_item.append(('actorId', actor.id))
            #     #     flow_item.append(('actorName', actor.company.name))
            #     #     flow_item.append(('lon', actor.geom.x))
            #     #     flow_item.append(('lat', actor.geom.y))
            #     # elif 'area' in field:
            #     #     area = areas[group[field]]
            #     #     flow_item.append(('areaId', area.id))
            #     #     flow_item.append(('areaName', area.name))
            #     # elif 'node' in field:
            #     #     label, model = level.split('_')
            #     #     flow_item.append((label, self.serialize_node(group[field], MODEL[model])))
            #     # elif 'waste' in field or \
            #     #      'activity' in field or \
            #     #      'process' in field or \
            #     #      'month' in field:
            #     #     if format == 'parallelsets':
            #     #         label = field.split('__')[0]
            #     #         flow_item.append((label, {'id': group[field]}))
            #     #     else:
            #     #         self.serialize_hierarchy(field, group, flow_item)
            data.append(OrderedDict(flow_item))

        return data

    # @staticmethod
    # def format_flows(space, queryset, levels, fields):
    #     # recover all areas of the selected
    #     # administrative level
    #     adminlevel = space.pop('adminlevel', None)
    #     if adminlevel:
    #         areas = Area.objects.filter(adminlevel=adminlevel)
    #
    #         # Actor level is the only one
    #         # with no areas!
    #         if areas.count() != 0:
    #             # origin area
    #             subq = areas.filter(geom__contains=OuterRef('origin__geom'))
    #             queryset = queryset.annotate(origin_node=Subquery(subq.values('id')))
    #
    #             # destination area
    #             subq = areas.filter(geom__contains=OuterRef('destination__geom'))
    #             queryset = queryset.annotate(destination_node=Subquery(subq.values('id')))
    #
    #             # append to other dimensions
    #             levels.extend(['origin_area', 'destination_area'])
    #             fields.extend(['origin_node', 'destination_node'])
    #         else:
    #             # origin actor
    #             queryset = queryset.annotate(origin_node=F('origin'))
    #             # destination actor
    #             queryset = queryset.annotate(destination_node=F('destination'))
    #
    #             # append to other dimensions
    #             levels.extend(['origin_actor', 'destination_actor'])
    #             fields.extend(['origin_node', 'destination_node'])
    #     return queryset, levels, fields

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

    @staticmethod
    def serialize_space(field, group, item):
        # recover model instance
        model, id = MODEL[field], group[field]
        instance = model.objects.filter(id=id)[0]

        if 'area' in field:
            # serialize area
            item.append(('areaId', instance.id))
            item.append(('areaName', instance.name))
        elif 'actor' in field:
            # serialize actor
            item.append(('actorId', instance.id))
            item.append(('actorName', instance.company.identifier))
            item.append(('lon', instance.geom.x))
            item.append(('lat', instance.geom.y))

    @staticmethod
    def serialize_node(id, model):
        # recover
        node = model.objects.filter(id=id)[0]

        # serialize area
        item = {}
        item['id'] = node.id

        # serialize geometry
        geom = node.geom
        if geom.geom_type == 'Point':
            item['name'] = node.company.name
            item['lon'] = geom.x
            item['lat'] = geom.y
        else:
            item['name'] = node.name
            item['lon'] = geom.centroid.x
            item['lat'] = geom.centroid.y
        return item