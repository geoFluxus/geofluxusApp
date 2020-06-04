from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from django.contrib.admin import TabularInline
from geofluxus.apps.login.models import (UserFilter,
                                         UserDataset,
                                         DatasetInUser)


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(CustomAdmin):
    search_fields = ['user__username']


# Dataset
class DatasetInUserInline(TabularInline):
    model = DatasetInUser


# User Dataset
@admin.register(UserDataset)
class UserDatasetAdmin(CustomAdmin):
    inlines = (DatasetInUserInline,)