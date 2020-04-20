from geofluxus.apps.asmfa.views import FilterFlowViewSet
from geofluxus.apps.asmfa.models import (Area,
                                         Actor,
                                         Waste04,
                                         Waste06)
from collections import OrderedDict
from django.db.models import (OuterRef, Subquery, F)


MODEL ={
    'actor': Actor,
    'area': Area
}


class ImpactViewSet(FilterFlowViewSet):
    def serialize(self, queryset, dimensions, format):
        '''
        Serialize data into groups
        according to the requested dimensions
        '''
        data = []

        # annotate info from chains to flows
        queryset = queryset.annotate(amount=F('flowchain__amount'))

        # recover dimensions
        time = dimensions.pop('time', None)
        space = dimensions.pop('space', None)
        eco = dimensions.pop('economicActivity', None)
        treat = dimensions.pop('treatmentMethod', None)
        mat = dimensions.pop('material', None)

        # TIME DIMENSION
        levels, fields = [], []
        if time:
            levels.append(time.split('__')[-1])
            fields.append(time)

        # SPACE DIMENSION
        if space:
            if format:
                queryset, levels, fields = self.format_flows(space, queryset,
                                                             levels, fields)
            else:
                queryset, levels, fields = self.format_space(space, queryset,
                                                             levels, fields)

        # ECO DIMENSION
        if eco:
            levels.append(eco.split('__')[-1])
            fields.append(eco)

        # TREAT DIMENSION
        if treat:
            levels.append(treat.split('__')[-1])
            fields.append(treat)

        # MATERIAL DIMENSION
        if mat:
            levels.append(mat.split('__')[-1])
            fields.append(mat)

        # workaround Django ORM bug
        queryset = queryset.order_by()

        # aggregate flows into groups
        groups = queryset.values(*fields).distinct()

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

            # retrieve group
            grouped = queryset.filter(**group)
            # and EXCLUDE it from further search...
            #queryset = queryset.exclude(**group)

            # aggregate amount
            group_amount = sum(grouped.values_list('amount', flat=True))

            # for the dimensions, return the id
            # to recover any info in the frontend
            flow_item = [('amount', group_amount)]
            for level, field in zip(levels, fields):
                if field == 'area':
                    self.serialize_area(group[field], flow_item)
                elif field == 'actor':
                    self.serialize_actor(group[field], flow_item)
                elif 'node' in field:
                    level, model = level.split('_')
                    flow_item.append((level, self.serialize_node(group[field], MODEL[model])))
                elif 'waste' in field:
                    self.serialize_waste(field, group, flow_item)
                else:
                    flow_item.append((level, group[field]))

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
    def serialize_area(id, item):
        # recover area info
        area = Area.objects.filter(id=id)[0]

        # serialize area
        item.append(('areaId', area.id))
        item.append(('areaName', area.name))
        return item

    @staticmethod
    def serialize_actor(id, item):
        # recover
        actor = Actor.objects.filter(id=id)[0]

        # serialize actor
        item.append(('actorId', actor.id))
        item.append(('actorName', actor.company.identifier))
        item.append(('lon', actor.geom.x))
        item.append(('lat', actor.geom.y))
        return item

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
    def serialize_waste(field, group, item):
        if 'waste02' in field:
            item.append(('waste02', group[field]))
        elif 'waste04' in field:
            waste04 = Waste04.objects.filter(id=group[field])[0]
            item.append(('waste04', group[field]))
            item.append(('waste02', waste04.waste02.id))
        else:
            waste06 = Waste06.objects.filter(id=group[field])[0]
            item.append(('waste06', group[field]))
            item.append(('waste04', waste06.waste04.id))
            item.append(('waste02', waste06.waste04.waste02.id))
        return item