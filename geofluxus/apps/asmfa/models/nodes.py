from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Publication)


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
    geom = gis.PointField(blank=True,
                          null=True)
    activity = models.ForeignKey(Activity,
                                 on_delete=models.CASCADE)
    identifier = models.CharField(max_length=255)
    company = models.ForeignKey(Company,
                                on_delete=models.CASCADE)
    postcode = models.CharField(max_length=10)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    publication = models.ForeignKey(Publication,
                                    null=True, blank=True,
                                    on_delete=models.CASCADE)
