from django.contrib import admin
from django.contrib.admin import TabularInline
from django.contrib.gis.admin import GeoModelAdmin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
                                         Company,
                                         Actor,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         GNcode,
                                         TreatmentEmission,
                                         Material,
                                         Product,
                                         Composite,
                                         Year,
                                         Month,
                                         FlowChain,
                                         MaterialInChain,
                                         ProductInChain,
                                         CompositeInChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         AdminLevel,
                                         Area,
                                         Dataset,
                                         DatasetType,
                                         Routing,
                                         Vehicle)


# Custom Admin
# supports non-geo and geo models
class CustomAdmin(GeoModelAdmin):
    # minimum pagination for faster loading
    list_per_page = 10

    def __init__(self, model, admin_site):
        super().__init__(model, admin_site)
        self.get_raw_id_fields()

    # avoid loading all instances of foreign key models
    # as dropdown lists in admin site
    def get_raw_id_fields(self):
        foreign_keys = []
        fields = self.model._meta.fields
        for field in fields:
            if field.get_internal_type() == 'ForeignKey':
                foreign_keys.append(field.name)
        self.raw_id_fields = tuple(foreign_keys)

    def get_ordering(self, request):
        return self.search_fields


# Activity Group
@admin.register(ActivityGroup)
class ActivityGroupAdmin(CustomAdmin):
    search_fields = ['code']


# Activity
@admin.register(Activity)
class ActivityAdmin(CustomAdmin):
    search_fields = ['nace']


# ProcessGroup
@admin.register(ProcessGroup)
class ProcessGroupAdmin(CustomAdmin):
    search_fields = ['name']


# Process
@admin.register(Process)
class ProcessAdmin(CustomAdmin):
    search_fields = ['code']


# Company
@admin.register(Company)
class CompanyAdmin(CustomAdmin):
    search_fields = ['name']


# Actor
@admin.register(Actor)
class ActorAdmin(CustomAdmin):
    search_fields = ['identifier']


# Waste02
@admin.register(Waste02)
class Waste02Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# Waste04
@admin.register(Waste04)
class Waste04Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# Waste06
@admin.register(Waste06)
class Waste06Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# GNcode
@admin.register(GNcode)
class GNcodeAdmin(CustomAdmin):
    search_fields = ['code', 'name']


# Treatment emissions
@admin.register(TreatmentEmission)
class TreatmentEmissionAdmin(CustomAdmin):
    search_fields = ['processgroup__code', 'waste06__ewc_code']


# Material
@admin.register(Material)
class MaterialAdmin(CustomAdmin):
    search_fields = ['name']


# Product
@admin.register(Product)
class ProductAdmin(CustomAdmin):
    search_fields = ['name']


# Composite
@admin.register(Composite)
class CompositeAdmin(CustomAdmin):
    search_fields = ['name']


# Year
@admin.register(Year)
class YearAdmin(CustomAdmin):
    search_fields = ['code']


# Month
@admin.register(Month)
class MonthAdmin(CustomAdmin):
    search_fields = ['year__code', 'code']


# Flowchain
class MaterialInChainInline(TabularInline):
    model = MaterialInChain


class ProductInChainInline(TabularInline):
    model = ProductInChain


class CompositeInChainInline(TabularInline):
    model = CompositeInChain


@admin.register(FlowChain)
class FlowChainAdmin(CustomAdmin):
    inlines = (MaterialInChainInline,
               ProductInChainInline,
               CompositeInChainInline)
    search_fields = ['identifier']


# Flow
@admin.register(Flow)
class FlowAdmin(CustomAdmin):
    search_fields = ['flowchain__identifier']


# Classification
@admin.register(Classification)
class ClassificationAdmin(CustomAdmin):
    search_fields = ['flowchain__identifier']


# ExtraDescription
@admin.register(ExtraDescription)
class ExtraDescriptionAdmin(CustomAdmin):
    search_fields = ['flowchain__identifier']


# AdminLevel
@admin.register(AdminLevel)
class AdminLevelAdmin(CustomAdmin):
    search_fields = ['name']


# Area
@admin.register(Area)
class AreaAdmin(CustomAdmin):
    search_fields = ['name']


# Dataset
admin.site.register(Dataset)
class DatasetAdmin(CustomAdmin):
    search_fields = ['title']
admin.site.register(DatasetType, CustomAdmin)


# Routing
@admin.register(Routing)
class RoutingAdmin(CustomAdmin):
    search_fields = ['origin__identifier',
                     'destination__identifier']


# Vehicle
@admin.register(Vehicle)
class VehicleAdmin(CustomAdmin):
    search_fields = ['name']