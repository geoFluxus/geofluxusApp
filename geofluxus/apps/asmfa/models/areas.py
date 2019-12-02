from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Publication)


# AdminLevel
class AdminLevel(models.Model):
    name = models.CharField(max_length=255)
    level = models.IntegerField()

    def create_area(self, **kwargs):
        """Create an area of the according level"""
        area = Area.objects.create(adminlevel=self, **kwargs)
        return area


# Area
class Area(models.Model):
    adminlevel = models.ForeignKey(AdminLevel,
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