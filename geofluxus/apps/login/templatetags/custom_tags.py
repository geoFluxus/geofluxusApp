from django import template
from geofluxus.apps.login.models import GroupDataset

register = template.Library()

@register.filter
def datasets(user):
    # check all user groups
    groups = user.groups.values_list('id', flat=True)

    # retrieve datasets for these groups
    datasets = GroupDataset.objects.filter(group__id__in=groups)\
                                   .values_list('dataset__id', flat=True)\

    if datasets or user.is_superuser:
        return True
    return False


@register.filter
def isDemoUser(user):
    # check all user groups
    groups = user.groups.values_list('name', flat=True)

    if 'Demo' in groups:
        return True
    return False


@register.filter
def isExpertUser(user):
    # check all user groups
    groups = user.groups.values_list('name', flat=True)

    if 'Expert' in groups:
        return True
    return False