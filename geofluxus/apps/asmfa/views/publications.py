from rest_framework.viewsets import ModelViewSet
from geofluxus.apps.asmfa.models import (PublicationType,
                                         Publication)
from geofluxus.apps.asmfa.serializers import (PublicationTypeSerializer,
                                              PublicationSerializer)


# PublicationType
class PublicationTypeViewSet(ModelViewSet):
    queryset = PublicationType.objects.all()
    serializer_class = PublicationTypeSerializer


# Publication
class PublicationViewSet(ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer