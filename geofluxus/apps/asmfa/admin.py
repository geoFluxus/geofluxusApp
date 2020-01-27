from django.contrib import admin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Actor,
                                         Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite,
                                         FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         AdminLevel,
                                         Area,
                                         Publication,
                                         PublicationType)
from django.contrib.gis.admin import GeoModelAdmin


# Register your models here.
admin.site.register(ActivityGroup)
admin.site.register(Activity)
admin.site.register(Actor, GeoModelAdmin)
admin.site.register(Process)
admin.site.register(Waste)
admin.site.register(Material)
admin.site.register(Product)
admin.site.register(Composite)
admin.site.register(FlowChain)
admin.site.register(Flow)
admin.site.register(Classification)
admin.site.register(ExtraDescription)
admin.site.register(AdminLevel)
admin.site.register(Area)
admin.site.register(Publication)
admin.site.register(PublicationType)