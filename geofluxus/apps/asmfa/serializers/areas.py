from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area,
                                         Actor)
from rest_framework_gis.serializers import (GeometryField)
from rest_framework.relations import HyperlinkedIdentityField


# AdminLevel
class AdminLevelSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = AdminLevel
        fields = ('url',
                  'id',
                  'name',
                  'level',
                  'resolution',
                  'area_set')

    area_set = HyperlinkedIdentityField(
        view_name='area-list',
        lookup_url_kwarg='level_pk'
    )


class AdminLevelListSerializer(AdminLevelSerializer):
    class Meta(AdminLevelSerializer.Meta):
        fields = ('id',
                  'name',
                  'level',
                  'resolution',
                  'area_set')


# Area
class AreaSerializer(HyperlinkedModelSerializer):
    geom = GeometryField()
    adminlevel = PrimaryKeyRelatedField(read_only=True)
    parent_area = PrimaryKeyRelatedField(read_only=True)
    publication = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Area
        geo_field = 'geom'
        fields = ('id',
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


# Actor
class ActorSerializer(HyperlinkedModelSerializer):
    geom = GeometryField()
    activity = PrimaryKeyRelatedField(read_only=True)
    process = PrimaryKeyRelatedField(read_only=True)
    company = PrimaryKeyRelatedField(read_only=True)
    publication = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Actor
        geo_field = 'geom'
        fields = ('url',
                  'id',
                  'geom',
                  'activity',
                  'process',
                  'identifier',
                  'company',
                  'postcode',
                  'address',
                  'city',
                  'country',
                  'publication',)


class ActorListSerializer(ActorSerializer):
    class Meta(ActorSerializer.Meta):
        fields = ('id',
                  'geom',
                  'activity',
                  'process',
                  'identifier',
                  'company',
                  'postcode',
                  'address',
                  'city',
                  'country',
                  'publication',)