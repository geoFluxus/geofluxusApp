from django.db import models
from django.contrib.auth.models import User, Group
from geofluxus.apps.asmfa.models import Dataset


# Save / edit user filters
class UserFilter(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE)
    name = models.CharField(max_length=255,
                            blank=True,
                            null=True)
    filter = models.TextField()
    date = models.DateTimeField(blank=True,
                                null=True)

    def __str__(self):
        return f'{self.user}: {self.name} ({self.date})'


# Relate groups to datasets
class GroupDataset(models.Model):
    group = models.ForeignKey(Group,
                              on_delete=models.CASCADE)
    datasets = models.ManyToManyField(Dataset,
                                      through='DatasetInGroup')

    def __str__(self):
        return f'{self.group}'


# DatasetInGroup
class DatasetInGroup(models.Model):
    groupdataset = models.ForeignKey(GroupDataset,
                                     on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset,
                                on_delete=models.CASCADE)
