from django.contrib import admin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Actor,
                                         Process,
                                         Waste,
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
                                         PublicationType)
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
admin.site.register(Process)
admin.site.register(Waste)
admin.site.register(Material)
admin.site.register(Product)
admin.site.register(Composite)
admin.site.register(FlowChain, FlowChainAdmin)
admin.site.register(Flow)
admin.site.register(Classification)
admin.site.register(ExtraDescription)
admin.site.register(AdminLevel)
admin.site.register(Area)
admin.site.register(Publication)
admin.site.register(PublicationType)