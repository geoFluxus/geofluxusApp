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


class PublicationTypeListSerializer(PublicationTypeSerializer):
    class Meta(PublicationTypeSerializer.Meta):
        fields = ('id',
                  'name')


# Publication
class PublicationSerializer(HyperlinkedModelSerializer):
    publicationtype = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Publication
        fields = ('url',
                  'id',
                  'citekey',
                  'author',
                  'note',
                  'title',
                  'publicationtype',
                  'url',
                  'file_url')


class PublicationListSerializer(PublicationSerializer):
    class Meta(PublicationSerializer.Meta):
        fields = ('id',
                  'citekey',
                  'author',
                  'note',
                  'title',
                  'publicationtype',
                  'url',
                  'file_url')