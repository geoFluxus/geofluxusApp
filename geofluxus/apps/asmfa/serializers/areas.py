from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area)
from rest_framework_gis.serializers import (GeoFeatureModelSerializer,
                                            GeometryField)


# AdminLevel
class AdminLevelSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = AdminLevel
        fields = ('url',
                  'id',
                  'name',
                  'level')


class AdminLevelListSerializer(AdminLevelSerializer):
    class Meta(AdminLevelSerializer.Meta):
        fields = ('id',
                  'name',
                  'level')


# Area
class AreaSerializer(HyperlinkedModelSerializer):
    geom = GeometryField()
    adminlevel = PrimaryKeyRelatedField(read_only=True)
    parent_area = PrimaryKeyRelatedField(read_only=True)
    publication = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Area
        geo_field = 'geom'
        fields = ('url',
                 'id',
                 'adminlevel',
                 'name',
                 'code',
                 'geom',
                 'parent_area',
                 'inhabitants',
                 'publication')


class AreaListSerializer(AreaSerializer):
    class Meta(AreaSerializer.Meta):
        fields = ('id',
                  'adminlevel',
                  'name',
                  'code',
                  'geom',
                  'parent_area',
                  'inhabitants',
                  'publication')