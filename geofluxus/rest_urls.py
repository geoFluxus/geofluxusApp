from rest_framework_nested.routers import (DefaultRouter,
                                           NestedSimpleRouter)
from django.urls import re_path, include
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
                                        AgendaViewSet,
                                        IndustryViewSet,
                                        ChainViewSet,
                                        GNcodeViewSet,
                                        GrondstofViewSet,
                                        TreatmentEmissionViewSet,
                                        YearViewSet,
                                        MonthViewSet,
                                        FlowChainViewSet,
                                        FlowViewSet,
                                        AdminLevelViewSet,
                                        AreaViewSet,
                                        AreaInLevelViewSet,
                                        DatasetTypeViewSet,
                                        DatasetViewSet,
                                        RoutingViewSet,
                                        WaysViewSet,
                                        VehicleViewSet)
from geofluxus.apps.login.views import (UserFilterViewSet)
from geofluxus.apps.analyse.views import (MonitorViewSet,)
from geofluxus.apps.analyse.views import (ImpactViewSet,)
from geofluxus.apps.fileshare.views import (SharedFileViewSet)


router = DefaultRouter()

# Datasets
router.register(r'datasettypes', DatasetTypeViewSet)
router.register(r'datasets', DatasetViewSet)

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
router.register(r'agendas', AgendaViewSet)
router.register(r'industries', IndustryViewSet)
router.register(r'chains', ChainViewSet)
router.register(r'gncodes', GNcodeViewSet)
router.register(r'grondstofs', GrondstofViewSet)
router.register(r'treatmentemissions', TreatmentEmissionViewSet)
router.register(r'years', YearViewSet)
router.register(r'months', MonthViewSet)

# Flows
router.register(r'flowchains', FlowChainViewSet)
router.register(r'allflows', FlowViewSet)
router.register(r'monitorflows', MonitorViewSet)
router.register(r'impactflows', ImpactViewSet)
router.register(r'routings', RoutingViewSet)

# Login
router.register(r'filters', UserFilterViewSet)

# Areas in Level
level_router = NestedSimpleRouter(router, r'levels', lookup='level')
level_router.register(r'areas', AreaInLevelViewSet)

# SharedFile
router.register(r'sharedfiles', SharedFileViewSet)

urlpatterns = [
    re_path(r'^', include(router.urls)),
    re_path(r'^', include(level_router.urls)),
]