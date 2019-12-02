from rest_framework import viewsets
from geofluxus.apps.asmfa.models import (ActivityGroup)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer)


# Activity group
class ActivityGroupViewSet(viewsets.ModelViewSet):
    queryset = ActivityGroup.objects.all()
    serializer_class = ActivityGroupSerializer