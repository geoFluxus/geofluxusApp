from rest_framework_nested.routers import (DefaultRouter,
                                           NestedSimpleRouter)
from django.conf.urls import url, include
from geofluxus.apps.asmfa.views import (ActivityGroupViewSet,
                                        ActivityViewSet,
                                        CompanyViewSet,
                                        ActorViewSet,
                                        ProcessViewSet,
                                        WasteViewSet,
                                        MaterialViewSet,
                                        ProductViewSet,
                                        CompositeViewSet,
                                        FlowChainViewSet,
                                        FlowViewSet,
                                        FilterFlowViewSet,
                                        ClassificationViewSet,
                                        ExtraDescriptionViewSet,
                                        AdminLevelViewSet,
                                        AreaViewSet,
                                        PublicationTypeViewSet,
                                        PublicationViewSet)


router = DefaultRouter()

# Publications
router.register(r'publicationtypes', PublicationTypeViewSet)
router.register(r'publications', PublicationViewSet)

# Areas
router.register(r'levels', AdminLevelViewSet)
router.register(r'areas', AreaViewSet)

# Nodes
router.register(r'activitygroups', ActivityGroupViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'actors', ActorViewSet)

# Keyflows
router.register(r'processes', ProcessViewSet)
router.register(r'wastes', WasteViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'products', ProductViewSet)
router.register(r'composites', CompositeViewSet)

# Flows
router.register(r'flowchains', FlowChainViewSet)
router.register(r'flows', FilterFlowViewSet)
router.register(r'classifications', ClassificationViewSet)
router.register(r'extradescriptions', ExtraDescriptionViewSet)

# Areas in Level
urlpatterns = [
    url(r'^', include(router.urls)),
]