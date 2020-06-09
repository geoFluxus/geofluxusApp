from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Dataset,
                                         Activity,
                                         Process,
                                         Company)


# AdminLevel
class AdminLevel(models.Model):
    name = models.CharField(max_length=255)
    level = models.IntegerField()
    resolution = models.FloatField(default=0)

    def __str__(self):
        return self.name

    def create_area(self, **kwargs):
        """Create an area of the according level"""
        area = Area.objects.create(adminlevel=self, **kwargs)
        return area


# Custom AreaQueryset
# to simplify geometry for rendering
class AreaQueryset(models.query.QuerySet):
    def simplified(self, tolerance=0.01, level=None):
        return self.raw(
            '''
            SELECT id,
                   ST_Simplify(geom, {tolerance})::bytea as geom
            FROM asmfa_area
            WHERE adminlevel_id = {level}
            '''.format(tolerance=tolerance,
                       level=level)
        )


# Custom AreaManager
# for the AreaQueryset
class AreaManager(models.Manager):
    def get_queryset(self):
        return AreaQueryset(self.model, using=self._db)

    def simplified(self, level=None):
        adminLevel = AdminLevel.objects.filter(id=level)
        tolerance = adminLevel.values_list('resolution', flat=None)[0][0]
        return self.get_queryset().simplified(tolerance=tolerance,
                                              level=level)

    @staticmethod
    def update_actors(created):
        queryset = Actor.objects
        for c in created:
            # fetch all actors within area
            actors = queryset.filter(geom__within=c.geom)

            # do not update actors with HIGHER admin level!
            actors = actors.exclude(area__adminlevel__level__gt=c.adminlevel.level)
            actors.update(area=c.pk)

    # update actor on area bulk upload
    def bulk_create(self, objs, **kwargs):
        created = super(AreaManager, self).bulk_create(objs, **kwargs)
        self.update_actors(created)
        return created


class Area(models.Model):
    # Add custom manager
    objects = AreaManager()

    adminlevel = models.ForeignKey(AdminLevel,
                                   null=True, blank=True,
                                   on_delete=models.CASCADE)
    name = models.TextField(null=True, blank=True)
    code = models.TextField()
    geom = gis.MultiPolygonField(null=True, blank=True)
    parent_area = models.ForeignKey("self", null=True, blank=True,
                                     on_delete=models.CASCADE)
    inhabitants = models.BigIntegerField(default=0)
    dataset = models.ForeignKey(Dataset,
                                null=True, blank=True,
                                on_delete=models.CASCADE)

    def __str__(self):
        return self.name


# Custom Actor Manager
# to update actors wih areas
# on Actor bulkupload
class ActorManager(models.Manager):
    @staticmethod
    def update_actors(created):
        queryset = Area.objects
        for actor in created:
            # order areas by administrative level (descending)
            areas = queryset.filter(geom__contains=actor.geom) \
                            .order_by('-adminlevel__level')
            actor.area = areas[0]
            actor.save()

    # update actor with area
    def bulk_create(self, objs, **kwargs):
        created = super(ActorManager, self).bulk_create(objs, ** kwargs)
        self.update_actors(created)
        return created

# Actor
class Actor(models.Model):
    objects = ActorManager()

    geom = gis.PointField(blank=True,
                          null=True)
    activity = models.ForeignKey(Activity,
                                 on_delete=models.CASCADE,
                                 blank=True, null=True)
    process = models.ForeignKey(Process,
                                on_delete=models.CASCADE,
                                blank=True, null=True)
    identifier = models.CharField(max_length=255)
    company = models.ForeignKey(Company,
                                on_delete=models.CASCADE)
    postcode = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    dataset = models.ForeignKey(Dataset,
                                null=True, blank=True,
                                on_delete=models.CASCADE)
    area = models.ForeignKey(Area,
                             null=True, blank=True,
                             on_delete=models.SET_NULL)

    def __str__(self):
        return self.identifier