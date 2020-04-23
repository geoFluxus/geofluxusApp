from django.db import models
from django.contrib.gis.db import models as gis


class Ways(models.Model):
    source = models.IntegerField()
    target = models.IntegerField()
    cost = models.FloatField()
    the_geom = gis.LineStringField(null=True,
                                   blank=True)

    class Meta:
        managed = False
        db_table = 'ways'
