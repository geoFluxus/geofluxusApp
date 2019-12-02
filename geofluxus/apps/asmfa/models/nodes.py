from django.db import models
from django.contrib.gis.db import models as gis


# Activity group
class ActivityGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)


# Activity
class Activity(models.Model):
    name = models.CharField(max_length=255)
    nace = models.CharField(max_length=255)
    activitygroup = models.ForeignKey(ActivityGroup,
                                      on_delete=models.CASCADE)


# Company
class Company(models.Model):
    name = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255)


# Actor
class Actor(models.Model):
    name = models.CharField(max_length=255)
    geom = gis.PointField(blank=True, null=True)
    activity = models.ForeignKey(Activity,
                                 on_delete=models.CASCADE)
    identifier = models.CharField(max_length=255)
    company = models.ForeignKey(Company,
                                on_delete=models.CASCADE)
    postcode = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    country = models.CharField(max_length=255)


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
