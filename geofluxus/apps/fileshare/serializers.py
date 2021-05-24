from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.fileshare.models import SharedFile


# SharedFile
class SharedFileSerializer(HyperlinkedModelSerializer):
    dataset = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SharedFile
        fields = ('url',
                  'id',
                  'name',
                  'url',
                  'dataset')


class SharedFileListSerializer(SharedFileSerializer):
    class Meta(SharedFileSerializer.Meta):
        fields = ('id',
                  'name',
                  'url',
                  'dataset')