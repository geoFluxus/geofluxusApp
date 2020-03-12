from django.contrib import admin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor,
                                         Process,
                                         ProcessGroup,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         Year,
                                         Month,
                                         Material,
                                         MaterialInChain,
                                         Product,
                                         ProductInChain,
                                         Composite,
                                         CompositeInChain,
                                         FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         AdminLevel,
                                         Area,
                                         Publication,
                                         PublicationType,
                                         Routing)
from django.contrib.admin import ModelAdmin, TabularInline
from django.contrib.auth.admin import UserAdmin
from django.contrib.gis.admin import GeoModelAdmin
from django.db.models.functions import Lower


class MaterialInChainInline(TabularInline):
    model = MaterialInChain


class ProductInChainInline(TabularInline):
    model = ProductInChain


class CompositeInChainInline(TabularInline):
    model = CompositeInChain


class FlowChainAdmin(ModelAdmin):
    inlines = (MaterialInChainInline,
               ProductInChainInline,
               CompositeInChainInline)

# Register your models here.
# Activity Group
class ActivityGroupAdmin(ModelAdmin):
    search_fields = ['code']

    def get_ordering(self, request):
        return ['code']
admin.site.register(ActivityGroup, ActivityGroupAdmin)

# Activity
class ActivityAdmin(ModelAdmin):
    search_fields = ['nace']

    def get_ordering(self, request):
        return ['nace']
admin.site.register(Activity, ActivityAdmin)

# Company
class CompanyAdmin(ModelAdmin):
    search_fields = ['name']

    def get_ordering(self, request):
        return [Lower('name')]
admin.site.register(Company, CompanyAdmin)

# Actor
class ActorAdmin(GeoModelAdmin):
    search_fields = ['identifier']

    def get_ordering(self, request):
        return [Lower('identifier')]
admin.site.register(Actor, ActorAdmin)

# ProcessGroup
class ProgressGroupAdmin(ModelAdmin):
    search_fields = ['code']

    def get_ordering(self, request):
        return ['code']
admin.site.register(ProcessGroup, ProgressGroupAdmin)

# Process
class ProgressAdmin(ModelAdmin):
    search_fields = ['code']

    def get_ordering(self, request):
        return ['code']
admin.site.register(Process, ProgressGroupAdmin)

# Waste02
class Waste02Admin(ModelAdmin):
    search_fields = ['ewc_code', 'ewc_name']

    def get_ordering(self, request):
        return ['ewc_code']
admin.site.register(Waste02, Waste02Admin)

# Waste04
class Waste04Admin(ModelAdmin):
    search_fields = ['ewc_code', 'ewc_name']

    def get_ordering(self, request):
        return ['ewc_code']
admin.site.register(Waste04, Waste04Admin)

# Waste06
class Waste06Admin(ModelAdmin):
    search_fields = ['ewc_code', 'ewc_name']

    def get_ordering(self, request):
        return ['ewc_code']
admin.site.register(Waste06, Waste06Admin)

# Material
class MaterialAdmin(ModelAdmin):
    search_fields = ['name']

    def get_ordering(self, request):
        return [Lower('name')]
admin.site.register(Material, MaterialAdmin)

# Product
class ProductAdmin(ModelAdmin):
    search_fields = ['name']

    def get_ordering(self, request):
        return [Lower('name')]
admin.site.register(Product, ProductAdmin)

# Composite
class CompositeAdmin(ModelAdmin):
    search_fields = ['name']

    def get_ordering(self, request):
        return [Lower('name')]
admin.site.register(Composite, CompositeAdmin)

# Year
class YearAdmin(ModelAdmin):
    def get_ordering(self, request):
        return ['code']
admin.site.register(Year, YearAdmin)

# Month
class MonthAdmin(ModelAdmin):
    def get_ordering(self, request):
        return ['year__code', 'code']
admin.site.register(Month, MonthAdmin)

admin.site.register(FlowChain, FlowChainAdmin)
admin.site.register(Flow)
admin.site.register(Classification)
admin.site.register(ExtraDescription)
admin.site.register(AdminLevel)
admin.site.register(Area, GeoModelAdmin)
admin.site.register(Publication)
admin.site.register(PublicationType)
admin.site.register(Routing, GeoModelAdmin)