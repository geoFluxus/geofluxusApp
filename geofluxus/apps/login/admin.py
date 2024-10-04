from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from django.contrib.admin import TabularInline
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


# Filter between user / dataset groups
class GroupFilter(admin.SimpleListFilter):
    title = 'group type'

    parameter_name = 'datasets'

    def lookups(self, request, model_admin):
        return (
            ('user', 'User groups'),
            ('dataset', 'Dataset groups')
        )

    def queryset(self, request, queryset):
        ids = []
        if self.value() == 'user':
            for group in queryset:
                if group.groupdataset_set.count() == 0:
                    ids.append(group.id)
            return queryset.filter(id__in=ids)
        if self.value() == 'dataset':
            for group in queryset:
                if group.groupdataset_set.count() > 0:
                    ids.append(group.id)
            print(ids)
            return queryset.filter(id__in=ids)


class GroupsAdmin(GroupAdmin):
    inlines = (GroupDatasetInline,)
    list_filter = [GroupFilter,]

    class Meta:
        model = Group


admin.site.unregister(Group)
admin.site.register(Group, GroupsAdmin)