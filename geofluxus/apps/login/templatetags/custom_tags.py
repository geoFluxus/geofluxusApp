from django import template
from geofluxus.apps.login.models import UserDataset

register = template.Library()

@register.filter
def datasets(user):
    user_datasets = UserDataset.objects.filter(user__id=user.id)
    if user_datasets and \
       user_datasets[0].datasets.count():
        return True
    return False