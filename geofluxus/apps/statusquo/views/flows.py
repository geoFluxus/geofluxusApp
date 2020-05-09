from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         Actor,
                                         ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         Year,
                                         Month)
from collections import OrderedDict
from django.db.models import (OuterRef, Subquery, F, Sum)

DIMENSIONS = ['time',
              'economicActivity',
              'treatmentMethod',
              'treatmentMethod', # check again for parallel sets
              'material']

MODEL = {
    'actor': Actor,
    'area': Area,
    'waste02': Waste02,
    'waste04': Waste04,
    'waste06': Waste06,
    'activitygroup': ActivityGroup,
    'activity': Activity,
    'processgroup': ProcessGroup,
    'process': Process,
    'year': Year,
    'month': Month,
}

PARENT = {
    'waste04': ['waste02'],
    'waste06': ['waste04', 'waste02'],
    'activity': ['activitygroup'],
    'process': ['processgroup'],
    'month': ['year']
}


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
                eco_inv = {x.pk:x for x in Activity.objects.only('activitygroup__id')}

            levels.append(level)
            fields.append(eco)

        # TREATMENT DIMENSION
        treat = dimensions.pop('treatmentMethod', None)
        treat_inv = {}
        if treat:
            # create inventory to recover parent activitygroup
            level = treat.split('__')[-1]
            if level == 'process':
                treat_inv = {x.pk: x for x in Process.objects.only('processgroup__id')}

            levels.append(level)
            fields.append(treat)
        # # all dimensions (except space)
        # for dim in dims:
        #     if dim:
        #         levels.append(dim.split('__')[-1])
        #         fields.append(dim)
        # # process space dimension separately
        # if space:
        #     if format == 'flowmap':
        #         queryset, levels, fields = self.format_flows(space, queryset,
        #                                                      levels, fields)
        #     else:
        #         queryset, levels, fields = self.format_space(space, queryset,
        #                                                      levels, fields)

        # workaround Django ORM bug
        # queryset = queryset.order_by()

        # aggregate flows into groups
        # groups = queryset.values(*fields).distinct()
        groups = queryset.values(*fields)\
                         .order_by(*fields)\
                         .annotate(total=Sum('amount'))


        # # convert queryset to list and process
        # # avoids hitting the database multiple times
        # queryset = list(queryset.values(*fields, 'amount'))
        #
        # # make matches between flow / group attributes
        # def check(flow, group):
        #     for field in fields:
        #         if flow[field] != group[field]: return False
        #     return True

        # serialize aggregated flow groups
        # actors = {x.pk:x for x in Actor.objects.all()}
        # areas = {x.pk: x for x in Area.objects.only('id', 'name')}
        for group in groups:
            # check for groups fields with null values!
            # these groups should be excluded entirely
            has_null = False
            for field, value in group.items():
                if not value:
                    has_null = True
                    break
            if has_null: continue

            # #
            # # # retrieve group
            # # #grouped = queryset.filter(**group)
            # # # and EXCLUDE it from further search...
            # # #queryset = queryset.exclude(**group)
            # #
            # # # aggregate amount
            # # group_amount = sum([flow['amount'] for flow in queryset if check(flow, group)])
            #
            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group['total'])]
            for level, field in zip(levels, fields):
                if level == 'activity':
                    activity = eco_inv[group[field]]
                    flow_item.append(('activitygroup', activity.activitygroup.id))
                elif level == 'process':
                    process = treat_inv[group[field]]
                    flow_item.append(('processgroup', process.processgroup.id))
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

    @staticmethod
    def format_flows(space, queryset, levels, fields):
        # recover all areas of the selected
        # administrative level
        adminlevel = space.pop('adminlevel', None)
        if adminlevel:
            areas = Area.objects.filter(adminlevel=adminlevel)

            # Actor level is the only one
            # with no areas!
            if areas.count() != 0:
                # origin area
                subq = areas.filter(geom__contains=OuterRef('origin__geom'))
                queryset = queryset.annotate(origin_node=Subquery(subq.values('id')))

                # destination area
                subq = areas.filter(geom__contains=OuterRef('destination__geom'))
                queryset = queryset.annotate(destination_node=Subquery(subq.values('id')))

                # append to other dimensions
                levels.extend(['origin_area', 'destination_area'])
                fields.extend(['origin_node', 'destination_node'])
            else:
                # origin actor
                queryset = queryset.annotate(origin_node=F('origin'))
                # destination actor
                queryset = queryset.annotate(destination_node=F('destination'))

                # append to other dimensions
                levels.extend(['origin_actor', 'destination_actor'])
                fields.extend(['origin_node', 'destination_node'])
        return queryset, levels, fields

    @staticmethod
    def format_space(space, queryset,
                     levels, fields):
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
                    levels.append('area')
                    fields.append('area')
                else:
                    # annotate origin / destination id
                    field = field.split('__')[0] + '__id'
                    queryset = queryset.annotate(actor=F(field))

                    # append to other dimensions
                    levels.append('actor')
                    fields.append('actor')
        return queryset, levels, fields

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

    @staticmethod
    def serialize_hierarchy(field, group, item):
        label, id = field.split('__')[-1], group[field]
        item.append((label, id))

        if label in PARENT.keys():
            for parent in PARENT[label]:
                model = MODEL[label]
                instance = model.objects.filter(id=id)[0]
                label, id = parent, getattr(instance, parent + '_id')
                item.append((label, id))