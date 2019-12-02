from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (PublicationType,
                                         Publication)


# PublicationType
class PublicationTypeSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PublicationType
        fields = ('url',
                  'id',
                  'name')


# Publication
class PublicationSerializer(HyperlinkedModelSerializer):
    type = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Publication
        fields = ('url',
                  'id',
                  'citekey',
                  'author',
                  'note',
                  'title',
                  'type',
                  'url',
                  'file_url')