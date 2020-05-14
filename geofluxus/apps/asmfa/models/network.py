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


class Vehicle(models.Model):
    name = models.CharField(max_length=255)
    min = models.FloatField()
    max = models.FloatField()
    co2 = models.FloatField()

    def __str__(self):
        return '{}'.format(self.name)
