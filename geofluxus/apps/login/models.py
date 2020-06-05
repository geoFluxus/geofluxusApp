from django.db import models
from django.contrib.auth.models import User
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


# Relate users to datasets
class UserDataset(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE)
    datasets = models.ManyToManyField(Dataset,
                                      through='DatasetInUser')

    def __str__(self):
        return f'{self.user}'


# DatasetInUser
class DatasetInUser(models.Model):
    userdataset = models.ForeignKey(UserDataset,
                                    on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset,
                                on_delete=models.CASCADE)
