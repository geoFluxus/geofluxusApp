from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        IntegerField)
from rest_framework_gis.serializers import (GeometryField)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor)


# Activity group
class ActivityGroupSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = ActivityGroup
        fields = ('url',
                  'id',
                  'name',
                  'code',
                  'flow_count')


class ActivityGroupListSerializer(ActivityGroupSerializer):
    class Meta(ActivityGroupSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',
                  'flow_count')


# Activity
class ActivitySerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)
    activitygroup = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Activity
        fields = ('url',
                  'id',
                  'name',
                  'nace',
                  'activitygroup',
                  'flow_count')


class ActivityListSerializer(ActivitySerializer):
    class Meta(ActivitySerializer.Meta):
        fields = ('id',
                  'name',
                  'nace',
                  'activitygroup',
                  'flow_count')


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
    flow_count = IntegerField(read_only=True)

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
                  'publication',
                  'flow_count')


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
                  'publication',
                  'flow_count')