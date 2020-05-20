from django.db import models
from geofluxus.apps.asmfa.models import (Waste06,
                                         Month,
                                         Material,
                                         Product,
                                         Composite,
                                         Actor,
                                         Publication)
from django.db.models import (Q, ExpressionWrapper, F, FloatField,
                              OuterRef, Subquery)
from django.contrib.gis.db import models as gis


# Routing
# Custom Routing Manager
# updates flows on routing bulk upload
class RoutingManager(models.Manager):
    @staticmethod
    def update_flows(created):
        queryset = Flow.objects
        for c in created:
            # fetch all flows with origin / destination & update
            flows = queryset.filter(Q(origin__id=c.origin.id) &\
                                    Q(destination__id=c.destination.id))
            flows.update(routing=c.pk)

    def bulk_create(self, objs, **kwargs):
        created = super(RoutingManager, self).bulk_create(objs, **kwargs)
        self.update_flows(created)
        return created


class Routing(models.Model):
    objects = RoutingManager()

    origin = models.ForeignKey(Actor,
                               on_delete=models.CASCADE,
                               related_name='start')
    destination = models.ForeignKey(Actor,
                                    on_delete=models.CASCADE,
                                    related_name='end')
    geom = gis.GeometryField(null=True,
                             blank=True)
    seq = models.TextField(null=True)
    distance = models.FloatField(default=0)

    def __str__(self):
        return '{} : {}'.format(self.origin,
                                self.destination)


# Vehicle
# Custom Vehicle Manager
# updates flows on vehicle bulk upload
class VehicleManager(models.Manager):
    @staticmethod
    def update_flows(created):
        queryset = Flow.objects
        # annotate amount/trips from chains to flows
        # exclude flows with no trips
        queryset = queryset.annotate(amount=F('flowchain__amount'),
                                     trips=F('flowchain__trips')) \
                           .exclude(trips=0)

        # compute capacity
        capacity = ExpressionWrapper((F('amount') / F('trips')),
                                     output_field=FloatField())
        queryset = queryset.annotate(capacity=capacity)

        for c in created:
            # fetch all flows with capacity & update
            flows = queryset.filter(capacity__gte=c.min,
                                    capacity__lte=c.max)
            flows.update(vehicle=c.pk)

    def bulk_create(self, objs, **kwargs):
        created = super(VehicleManager, self).bulk_create(objs, **kwargs)
        self.update_flows(created)
        return created


class Vehicle(models.Model):
    objects = VehicleManager()

    name = models.CharField(max_length=255)
    min = models.FloatField()
    max = models.FloatField()
    co2 = models.FloatField()

    def __str__(self):
        return '{}'.format(self.name)


# FlowChain
class FlowChain(models.Model):
    identifier = models.CharField(max_length=255)
    route = models.BooleanField()
    collector = models.BooleanField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    trips = models.IntegerField()
    month = models.ForeignKey(Month,
                              on_delete=models.CASCADE)
    waste06 = models.ForeignKey(Waste06,
                                on_delete=models.CASCADE)
    materials = models.ManyToManyField(Material,
                                       through='MaterialInChain')
    products = models.ManyToManyField(Product,
                                      through='ProductInChain')
    composites = models.ManyToManyField(Composite,
                                        through='CompositeInChain')
    publication = models.ForeignKey(Publication,
                                    null=True, blank=True,
                                    on_delete=models.CASCADE)

    def __str__(self):
        return self.identifier


# Flow
# Custom Flow Manager
# updates flows on bulk upload with routing/vehicle
class FlowManager(models.Manager):
    @staticmethod
    def update_flows(created):
        # retrieve created flows as queryset
        ids = [c.id for c in created]
        queryset = Flow.objects.filter(id__in=ids)

        # retrieve routings
        routing = Routing.objects.filter(Q(origin__id=OuterRef('origin__id')) &\
                                         Q(destination__id=OuterRef('destination__id')))

        # update flows
        queryset = queryset.annotate(rid=Subquery(routing.values('id')))
        queryset.update(routing=F('rid'))

    def bulk_create(self, objs, **kwargs):
        created = super(FlowManager, self).bulk_create(objs, **kwargs)
        self.update_flows(created)
        return created

class Flow(models.Model):
    objects = FlowManager()

    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    origin = models.ForeignKey(Actor,
                               on_delete=models.CASCADE,
                               related_name='outputs')
    destination = models.ForeignKey(Actor,
                                    on_delete=models.CASCADE,
                                    related_name='inputs')
    role_choices = [('production', 'production'),
                    ('treatment', 'treatment')]
    origin_role = models.CharField(max_length=255,
                                   choices=role_choices)
    destination_role = models.CharField(max_length=255,
                                        choices=role_choices)
    routing = models.ForeignKey(Routing,
                                null=True,
                                blank=True,
                                on_delete=models.SET_NULL)
    vehicle = models.ForeignKey(Vehicle,
                                null=True,
                                blank=True,
                                on_delete=models.SET_NULL)

    def __str__(self):
        return "{} : {} -> {}".format(self.flowchain,
                                      self.origin,
                                      self.destination)


# MaterialInChain
class MaterialInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    material = models.ForeignKey(Material,
                                 on_delete=models.CASCADE)


# ProductInChain
class ProductInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    product = models.ForeignKey(Product,
                                on_delete=models.CASCADE)


# CompositeInChain
class CompositeInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    composite = models.ForeignKey(Composite,
                                  on_delete=models.CASCADE)


# Classification
class Classification(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    clean = models.BooleanField(null=True)
    mixed = models.BooleanField(null=True)
    direct_use = models.BooleanField(null=True)
    composite = models.BooleanField(null=True)

    def __str__(self):
        return '{}'.format(self.flowchain)


# ExtraDescription
class ExtraDescription(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    description_type_choices = (("reason", "Reason"),
                                ("origin", "Origin"),
                                ("COL", "Colour"),
                                ("state", "State"),
                                ("DIM", "Dimensions"),
                                ("SH", "Shape"),
                                ("consistency", "Consistency"),
                                ("COD", "Codes"),
                                ("m-type", "Material type"),
                                ("p-type", "Product type"),
                                ("c-type", "Composite type"),
                                ("other", "Other")
                               )
    type = models.CharField(max_length=255, choices=description_type_choices)
    description = models.TextField(null=True)

    def __str__(self):
        return '{} : {}'.format(self.flowchain,
                                self.type)

