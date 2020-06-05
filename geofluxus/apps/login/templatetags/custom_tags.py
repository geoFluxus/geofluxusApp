from django import template
from geofluxus.apps.login.models import GroupDataset

register = template.Library()

@register.filter
def datasets(user):
    # check all user groups
    groups = (user.groups.values_list('id', flat=True))

    # retrieve datasets for these groups
    group_datasets = GroupDataset.objects.filter(group__id__in=groups)

    if group_datasets and \
       group_datasets[0].datasets.count():
        return True
    return False