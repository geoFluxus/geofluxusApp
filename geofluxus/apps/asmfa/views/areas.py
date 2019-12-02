from rest_framework.viewsets import ModelViewSet
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area)
from geofluxus.apps.asmfa.serializers import (AdminLevelSerializer,
                                              AreaSerializer)


# AdminLevel
class AdminLevelViewSet(ModelViewSet):
    queryset = AdminLevel.objects.all()
    serializer_class = AdminLevelSerializer


# Area
class AreaViewSet(ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer