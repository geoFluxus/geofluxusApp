from rest_framework_nested.routers import (DefaultRouter,
                                           NestedSimpleRouter)
from django.conf.urls import url, include
from geofluxus.apps.asmfa.views import (ActivityGroupViewSet,
                                        ActivityViewSet,
                                        CompanyViewSet,
                                        ActorViewSet,
                                        ProcessGroupViewSet,
                                        ProcessViewSet,
                                        Waste02ViewSet,
                                        Waste04ViewSet,
                                        Waste06ViewSet,
                                        MaterialViewSet,
                                        ProductViewSet,
                                        CompositeViewSet,
                                        YearViewSet,
                                        MonthViewSet,
                                        FlowChainViewSet,
                                        FlowViewSet,
                                        ClassificationViewSet,
                                        ExtraDescriptionViewSet,
                                        AdminLevelViewSet,
                                        AreaViewSet,
                                        AreaInLevelViewSet,
                                        TopoJSONViewSet,
                                        PublicationTypeViewSet,
                                        PublicationViewSet,
                                        RoutingViewSet,
                                        WaysViewSet,
                                        VehicleViewSet)
from geofluxus.apps.statusquo.views import (StatusQuoViewSet,)
from geofluxus.apps.impact.views import (ImpactViewSet,)


router = DefaultRouter()

# Publications
router.register(r'publicationtypes', PublicationTypeViewSet)
router.register(r'publications', PublicationViewSet)

# Areas
router.register(r'levels', AdminLevelViewSet)
router.register(r'allareas', AreaViewSet)

# Network
router.register(r'ways', WaysViewSet)
router.register(r'vehicles', VehicleViewSet)

# Nodes
router.register(r'activitygroups', ActivityGroupViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'actors', ActorViewSet)

# Keyflows
router.register(r'processgroups', ProcessGroupViewSet)
router.register(r'processes', ProcessViewSet)
router.register(r'wastes02', Waste02ViewSet)
router.register(r'wastes04', Waste04ViewSet)
router.register(r'wastes06', Waste06ViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'products', ProductViewSet)
router.register(r'composites', CompositeViewSet)
router.register(r'years', YearViewSet)
router.register(r'months', MonthViewSet)

# Flows
router.register(r'flowchains', FlowChainViewSet)
router.register(r'allflows', FlowViewSet)
router.register(r'statusquoflows', StatusQuoViewSet)
router.register(r'impactflows', ImpactViewSet)
router.register(r'classifications', ClassificationViewSet)
router.register(r'extradescriptions', ExtraDescriptionViewSet)
router.register(r'routings', RoutingViewSet)

# Areas in Level
level_router = NestedSimpleRouter(router, r'levels', lookup='level')
level_router.register(r'areas', AreaInLevelViewSet)
level_router.register(r'topojson', TopoJSONViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include(level_router.urls)),
]