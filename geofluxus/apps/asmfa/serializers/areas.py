from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area)


# AdminLevel
class AdminLevelSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = AdminLevel
        fields = ('url',
                  'id',
                  'name',
                  'level')


# Area
class AreaSerializer(HyperlinkedModelSerializer):
    adminlevel = PrimaryKeyRelatedField(read_only=True)
    parent_area = PrimaryKeyRelatedField(read_only=True)
    publication = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Area
        fields = ('url',
                 'id',
                 'adminlevel',
                 'name',
                 'code',
                 'geom',
                 'parent_area',
                 'inhabitants',
                 'publication'
                 )