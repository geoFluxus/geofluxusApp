from django.contrib import admin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
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
from django.contrib.gis.admin import GeoModelAdmin


class MaterialInChainInline(admin.TabularInline):
    model = MaterialInChain


class ProductInChainInline(admin.TabularInline):
    model = ProductInChain


class CompositeInChainInline(admin.TabularInline):
    model = CompositeInChain


class FlowChainAdmin(admin.ModelAdmin):
    inlines = (MaterialInChainInline,
               ProductInChainInline,
               CompositeInChainInline)


# Register your models here.
admin.site.register(ActivityGroup)
admin.site.register(Activity)
admin.site.register(Actor, GeoModelAdmin)
admin.site.register(ProcessGroup)
admin.site.register(Process)
admin.site.register(Waste02)
admin.site.register(Waste04)
admin.site.register(Waste06)
admin.site.register(Year)
admin.site.register(Month)
admin.site.register(Material)
admin.site.register(Product)
admin.site.register(Composite)
admin.site.register(FlowChain, FlowChainAdmin)
admin.site.register(Flow)
admin.site.register(Classification)
admin.site.register(ExtraDescription)
admin.site.register(AdminLevel)
admin.site.register(Area, GeoModelAdmin)
admin.site.register(Publication)
admin.site.register(PublicationType)
admin.site.register(Routing, GeoModelAdmin)