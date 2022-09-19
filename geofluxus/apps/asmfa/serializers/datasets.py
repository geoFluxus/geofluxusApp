from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        CharField)
from geofluxus.apps.asmfa.models import (DatasetType,
                                         Dataset)


# DatasetType
class DatasetTypeSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = DatasetType
        fields = ('url',
                  'id',
                  'name')


class DatasetTypeListSerializer(DatasetTypeSerializer):
    class Meta(DatasetTypeSerializer.Meta):
        fields = ('id',
                  'name')


# Dataset
class DatasetSerializer(HyperlinkedModelSerializer):
    datasettype = PrimaryKeyRelatedField(read_only=True)
    note = CharField()

    class Meta:
        model = Dataset
        fields = ('url',
                  'id',
                  'citekey',
                  'author',
                  'note',
                  'title',
                  'datasettype',
                  'url',
                  'file_url',
                  'routing_db')


class DatasetListSerializer(DatasetSerializer):
    class Meta(DatasetSerializer.Meta):
        fields = ('id',
                  'citekey',
                  'author',
                  'note',
                  'title',
                  'datasettype',
                  'url',
                  'file_url',
                  'routing_db')