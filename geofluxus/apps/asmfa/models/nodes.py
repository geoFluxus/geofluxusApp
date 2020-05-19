from django.db import models
from django.contrib.gis.db import models as gis
from geofluxus.apps.asmfa.models import (Publication)


# Activity group
class ActivityGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Activity
class Activity(models.Model):
    name = models.CharField(max_length=255)
    nace = models.CharField(max_length=255)
    activitygroup = models.ForeignKey(ActivityGroup,
                                      on_delete=models.CASCADE)

    def __str__(self):
        return '{} - {}'.format(self.nace, self.name)


# Process group
class ProcessGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Process
class Process(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    processgroup = models.ForeignKey(ProcessGroup,
                                     on_delete=models.CASCADE)

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Company
class Company(models.Model):
    name = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Actor
class Actor(models.Model):
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
    publication = models.ForeignKey(Publication,
                                    null=True, blank=True,
                                    on_delete=models.CASCADE)

    def __str__(self):
        return self.identifier
