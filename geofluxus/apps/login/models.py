from django.db import models
from django.contrib.auth.models import User, Group
from geofluxus.apps.asmfa.models import Dataset
from django.contrib import auth


# user reset password
class UserResetPassword(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE)
    date = models.DateTimeField(blank=True,
                                null=True)

    def __str__(self):
        return f'{self.user} ({self.date})'


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
    dataset = models.ForeignKey(Dataset,
                                null=True, blank=True,
                                on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.group}: {self.dataset}'


# get user datasets
def get_datasets(self):
    groups = self.groups.values_list('id', flat=True)
    ids = GroupDataset.objects.filter(group__id__in=groups) \
                              .values_list('dataset__id', flat=True) \
                              .distinct()
    return ids
auth.models.User.add_to_class('get_datasets', get_datasets)
