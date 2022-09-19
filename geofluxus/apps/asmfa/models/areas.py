from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Dataset,
                                         Activity,
                                         Process,
                                         Company)
from django.db import connections


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
    def simplified(self, tolerance=0.01, level=None, ids=[], request=None):
        query =\
            '''
            SELECT id,
                   ST_Simplify(geom, {tolerance})::bytea as geom
            FROM asmfa_area
            WHERE adminlevel_id = {level}
            '''.format(tolerance=tolerance,
                       level=level)
        if ids:
            ids = [str(id) for id in ids]
            query += 'AND id IN ({ids})'.format(ids=','.join(ids))
        if request:
            user = request.user
            ids = [str(id) for id in user.get_datasets()]
            if not user.is_superuser:
                query += 'AND dataset_id IN ({ids})'.format(ids=','.join(ids))
        return self.raw(query)


# Custom AreaManager
# for the AreaQueryset
class AreaManager(models.Manager):
    def get_queryset(self):
        return AreaQueryset(self.model, using=self._db)

    def simplified(self, level=None, ids=[], request=None):
        adminLevel = AdminLevel.objects.filter(id=level)
        tolerance = adminLevel.values_list('resolution', flat=None)[0][0]
        return self.get_queryset().simplified(tolerance=tolerance,
                                              level=level,
                                              ids=ids,
                                              request=request)

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
        # self.update_actors(created)
        return created


class Area(models.Model):
    # Add custom manager
    objects = AreaManager()

    adminlevel = models.ForeignKey(AdminLevel,
                                   null=True, blank=True,
                                   on_delete=models.CASCADE)
    name = models.TextField(null=True, blank=True)
    code = models.TextField(null=True, blank=True)
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
        ids = [c.id for c in created]

        with connections['default'].cursor() as cursor:
            query = f'''
                CREATE TABLE tmp AS (
                    SELECT actor.id AS actor, area.id AS area, level.level AS level
                    FROM asmfa_actor actor
                    JOIN asmfa_area area
                    ON ST_Contains(area.geom, actor.geom)
                    JOIN asmfa_adminlevel level
                    ON area.adminlevel_id = level.id
                    WHERE actor.area_id is NULL
                );
                
                CREATE TABLE actors2areas AS (
                    SELECT tmp.actor, tmp.area, tmp.level
                    FROM tmp
                    WHERE (tmp.actor, tmp.level) IN
                    (SELECT tmp.actor, max(tmp.level)
                     FROM tmp
                     GROUP BY tmp.actor)
                    ORDER BY tmp.level
                );
                
                UPDATE asmfa_actor
                SET area_id = actors2areas.area
                FROM actors2areas
                WHERE asmfa_actor.id = actors2areas.actor;
                
                DROP TABLE tmp, actors2areas;    
            '''
            cursor.execute(query)

    # update actor with area
    def bulk_create(self, objs, **kwargs):
        created = super(ActorManager, self).bulk_create(objs, ** kwargs)
        # self.update_actors(created)
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