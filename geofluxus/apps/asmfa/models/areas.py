from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Publication)


# AdminLevel
class AdminLevel(models.Model):
    name = models.CharField(max_length=255)
    level = models.IntegerField()

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
        return self.get_queryset().simplified(level=level)

# Area
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
    publication = models.ForeignKey(Publication,
                                    null=True, blank=True,
                                    on_delete=models.CASCADE)

    def __str__(self):
        return self.name