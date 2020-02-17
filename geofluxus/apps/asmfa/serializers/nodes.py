from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        CharField)
from rest_framework_gis.serializers import (GeoFeatureModelSerializer,
                                            GeometryField)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor)


# Activity group
class ActivityGroupSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('url',
                  'id',
                  'name',
                  'code')


class ActivityGroupListSerializer(ActivityGroupSerializer):
    class Meta(ActivityGroupSerializer.Meta):
        fields = ('id',
                  'name',
                  'code')


# Activity
class ActivitySerializer(HyperlinkedModelSerializer):
    activitygroup = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Activity
        fields = ('url',
                  'id',
                  'name',
                  'nace',
                  'activitygroup')


class ActivityListSerializer(ActivitySerializer):
    class Meta(ActivitySerializer.Meta):
        fields = ('id',
                  'name',
                  'nace',
                  'activitygroup')


# Company
class CompanySerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Company
        fields = ('url',
                  'id',
                  'name',
                  'identifier')


class CompanyListSerializer(CompanySerializer):
    class Meta(CompanySerializer.Meta):
        fields = ('url',
                  'id',
                  'name',
                  'identifier')


# Actor
class ActorSerializer(HyperlinkedModelSerializer):
    geom = GeometryField()
    activity = PrimaryKeyRelatedField(read_only=True)
    company = PrimaryKeyRelatedField(read_only=True)
    publication = PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Actor
        geo_field = 'geom'
        fields = ('url',
                  'id',
                  'geom',
                  'activity',
                  'identifier',
                  'company',
                  'postcode',
                  'address',
                  'city',
                  'country',
                  'publication')


class ActorListSerializer(ActorSerializer):
    class Meta(ActorSerializer.Meta):
        fields = ('id',
                  'geom',
                  'activity',
                  'identifier',
                  'company',
                  'postcode',
                  'address',
                  'city',
                  'country',
                  'publication')