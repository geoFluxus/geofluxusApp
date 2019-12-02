from rest_framework.viewsets import ModelViewSet
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription)
from geofluxus.apps.asmfa.serializers import (FlowChainSerializer,
                                              FlowSerializer,
                                              ClassificationSerializer,
                                              ExtraDescriptionSerializer)


# FlowChain
class FlowChainViewSet(ModelViewSet):
    queryset = FlowChain.objects.all()
    serializer_class = FlowChainSerializer


# Flow
class FlowViewSet(ModelViewSet):
    queryset = Flow.objects.all()
    serializer_class = FlowSerializer


# Classification
class ClassificationViewSet(ModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer


# ExtraDescription
class ExtraDescriptionViewset(ModelViewSet):
    queryset = ExtraDescription.objects.all()
    serializer_class = ExtraDescriptionSerializer