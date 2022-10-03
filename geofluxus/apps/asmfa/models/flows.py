from django.db import models
from geofluxus.apps.asmfa.models import (Waste06,
                                         Month,
                                         Actor,
                                         Dataset,
                                         GNcode,
                                         Grondstof)
from django.db.models import (Q, ExpressionWrapper, F, FloatField,
                              OuterRef, Subquery)
from django.contrib.gis.db import models as gis
from django.contrib.gis.db.models.functions import Length
from django.db import connections


# Routing
# Custom Routing Manager
# updates flows on routing bulk upload
class RoutingManager(models.Manager):
    @staticmethod
    def update_flows(created):
        # compute distance
        ids = [c.id for c in created]
        with connections['default'].cursor() as cursor:
            query = f'''
                CREATE TABLE flows2routings AS (
                    SELECT flow.id AS flow_id, routing.id AS routing_id
                    FROM asmfa_flow flow
                    JOIN asmfa_routing routing
                    ON (flow.origin_id = routing.origin_id 
                    AND flow.destination_id = routing.destination_id)
                    WHERE routing.id IN {tuple(ids)}
                );

                UPDATE asmfa_flow
                SET routing_id = flows2routings.routing_id
                FROM flows2routings
                WHERE asmfa_flow.id = flows2routings.flow_id;

                DROP TABLE flows2routings;
                
                UPDATE asmfa_routing
                SET distance = ST_Length(asmfa_routing.geom, true); 
            '''
            cursor.execute(query)

    def bulk_create(self, objs, **kwargs):
        created = super(RoutingManager, self).bulk_create(objs, **kwargs)
        # self.update_flows(created)
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
        return '{} -> {}'.format(self.origin,
                                 self.destination)


# Vehicle
# Custom Vehicle Manager
# updates flows on vehicle bulk upload
class VehicleManager(models.Manager):
    @staticmethod
    def update_flows(created):
        with connections['default'].cursor() as cursor:
            query = f'''
                CREATE TABLE tmp AS (
                    SELECT flow.id AS flow_id, flowchain.amount / flowchain.trips as capacity
                    FROM asmfa_flow flow
                    JOIN asmfa_flowchain flowchain
                    ON flow.flowchain_id = flowchain.id
                );
                
                CREATE TABLE flows2vehicles AS (
                    SELECT flow_id, vehicle.id AS vehicle_id
                    FROM tmp
                    JOIN asmfa_vehicle vehicle
                    ON (tmp.capacity >= vehicle.min AND tmp.capacity < vehicle.max)
                );
                
                UPDATE asmfa_flow
                SET vehicle_id = flows2vehicles.vehicle_id
                FROM flows2vehicles
                WHERE asmfa_flow.id = flows2vehicles.flow_id;
                                
                DROP TABLE tmp, flows2vehicles;    
            '''
            cursor.execute(query)

    def bulk_create(self, objs, **kwargs):
        created = super(VehicleManager, self).bulk_create(objs, **kwargs)
        # self.update_flows(created)
        return created


class Vehicle(models.Model):
    objects = VehicleManager()

    name = models.CharField(max_length=255)
    min = models.FloatField()
    max = models.FloatField()
    co2 = models.FloatField(default=0)
    nox = models.FloatField(default=0)
    so2 = models.FloatField(default=0)
    pm10 = models.FloatField(default=0)

    def __str__(self):
        return '{}'.format(self.name)


# FlowChain
class FlowChain(models.Model):
    identifier = models.CharField(max_length=255)
    route = models.BooleanField(null=True, blank=True)
    collector = models.BooleanField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    trips = models.IntegerField()
    month = models.ForeignKey(Month,
                              on_delete=models.CASCADE)
    waste06 = models.ForeignKey(Waste06,
                                on_delete=models.CASCADE,
                                null=True, blank=True)
    gncode = models.ForeignKey(GNcode,
                               on_delete=models.CASCADE,
                               null=True, blank=True)
    grondstof = models.ForeignKey(Grondstof,
                                  on_delete=models.CASCADE,
                                  null=True, blank=True)
    dataset = models.ForeignKey(Dataset,
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
        with connections['default'].cursor() as cursor:
            query = f'''
                CREATE TABLE tmp AS (
                    SELECT flow.id AS flow_id, flowchain.amount / flowchain.trips as capacity
                    FROM asmfa_flow flow
                    JOIN asmfa_flowchain flowchain
                    ON flow.flowchain_id = flowchain.id
                    WHERE flow.vehicle_id IS NULL
                );

                CREATE TABLE flows2vehicles AS (
                    SELECT flow_id, vehicle.id AS vehicle_id
                    FROM tmp
                    JOIN asmfa_vehicle vehicle
                    ON (tmp.capacity >= vehicle.min AND tmp.capacity < vehicle.max)
                );

                UPDATE asmfa_flow
                SET vehicle_id = flows2vehicles.vehicle_id
                FROM flows2vehicles
                WHERE asmfa_flow.id = flows2vehicles.flow_id;

                DROP TABLE tmp, flows2vehicles;
                
                CREATE TABLE flows2routings AS (
                    SELECT flow.id AS flow_id, routing.id AS routing_id
                    FROM asmfa_flow flow
                    JOIN asmfa_routing routing
                    ON (flow.origin_id = routing.origin_id 
                    AND flow.destination_id = routing.destination_id)
                    WHERE flow.routing_id IS NULL
                );

                UPDATE asmfa_flow
                SET routing_id = flows2routings.routing_id
                FROM flows2routings
                WHERE asmfa_flow.id = flows2routings.flow_id;

                DROP TABLE flows2routings;
                
                UPDATE asmfa_routing
                SET distance = ST_Length(asmfa_routing.geom, true)
                WHERE asmfa_routing.distance = 0; 
            '''
            cursor.execute(query)

    def bulk_create(self, objs, **kwargs):
        created = super(FlowManager, self).bulk_create(objs, **kwargs)
        # self.update_flows(created)
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

