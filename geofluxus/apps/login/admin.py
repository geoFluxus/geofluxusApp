from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from django.contrib.admin import TabularInline, StackedInline
from geofluxus.apps.login.models import (UserFilter,
                                         GroupDataset,)
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(CustomAdmin):
    search_fields = ['user__username']


# Group Dataset
class GroupDatasetInline(TabularInline):
    model = GroupDataset

class GroupsAdmin(GroupAdmin):
    inlines = (GroupDatasetInline,)
    class Meta:
        model = Group

admin.site.unregister(Group)
admin.site.register(Group, GroupsAdmin)