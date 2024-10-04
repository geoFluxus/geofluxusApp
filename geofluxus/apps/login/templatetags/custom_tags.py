from django import template
from geofluxus.apps.login.models import GroupDataset, UserResetPassword
from datetime import datetime, timedelta

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


@register.filter
def isOVAM(user):
    # check all user groups
    groups = user.groups.values_list('name', flat=True)

    if 'OVAM' in groups:
        return True
    return False


@register.filter
def password_expired(user):
    current_date = datetime.now()
    past_limit = current_date - timedelta(days=180)
    password_expiration = UserResetPassword.objects.filter(user=user.id)\
        .order_by('-date').first()

    return password_expiration.date < past_limit