from rest_framework import routers
from django.conf.urls import url, include
from geofluxus.apps.asmfa.views import (ActivityGroupViewSet)


router = routers.DefaultRouter()
router.register(r'activitygroups', ActivityGroupViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]