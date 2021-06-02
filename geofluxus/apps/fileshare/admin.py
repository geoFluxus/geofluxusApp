from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from geofluxus.apps.fileshare.models import (SharedFile)
from geofluxus.apps.asmfa.models import (Dataset)
from django.contrib.auth.models import Group
from geofluxus.apps.login.models import (GroupDataset,)
from operator import itemgetter


# Filter shared files by dataset
class SharedFileByDatasetFilter(admin.SimpleListFilter):
    title = 'dataset'

    parameter_name = 'datasets'

    def lookups(self, request, model_admin):
        datasets = Dataset.objects.all()
        options = []
        for dataset in datasets:
            options.append([dataset.id, dataset.title])
        options = sorted(options, key=itemgetter(1))
        return options

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(dataset__id=self.value())


# Filter shared files by group dataset
class SharedFileByGroupDatasetFilter(admin.SimpleListFilter):
    title = 'dataset group'

    parameter_name = 'dataset group'

    def lookups(self, request, model_admin):
        groups = Group.objects.all()
        options = []
        for group in groups:
            datasets = group.groupdataset_set.all()
            if len(datasets):
                options.append([group.id, group.name])
        options = sorted(options, key=itemgetter(1))
        return options

    def queryset(self, request, queryset):
        if self.value():
            groups = Group.objects.filter(id=self.value())\
                                  .values_list('id', flat=True)
            ids = GroupDataset.objects.filter(group__id__in=groups)\
                                      .values_list('dataset__id', flat=True)\
                                      .distinct()
            return queryset.filter(dataset__id__in=ids)


@admin.register(SharedFile)
class SharedFileAdmin(CustomAdmin):
    search_fields = ['name']
    list_filter = [
        SharedFileByDatasetFilter,
        SharedFileByGroupDatasetFilter
    ]
