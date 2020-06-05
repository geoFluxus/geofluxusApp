from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from django.contrib.admin import TabularInline
from geofluxus.apps.login.models import (UserFilter,
                                         GroupDataset,
                                         DatasetInGroup)


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(CustomAdmin):
    search_fields = ['user__username']


# Dataset
class DatasetInGroupInline(TabularInline):
    model = DatasetInGroup


# Group Dataset
@admin.register(GroupDataset)
class UserDatasetAdmin(CustomAdmin):
    inlines = (DatasetInGroupInline,)