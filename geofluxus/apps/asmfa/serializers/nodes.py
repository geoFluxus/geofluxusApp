from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        IntegerField)
from rest_framework_gis.serializers import (GeometryField)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
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


# Process group
class ProcessGroupSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = ProcessGroup
        fields = ('url',
                  'id',
                  'name',
                  'code',
                  'flow_count')

class ProcessGroupListSerializer(ProcessGroupSerializer):
    class Meta(ProcessGroupSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',
                  'flow_count')


# Process
class ProcessSerializer(HyperlinkedModelSerializer):
    processgroup = PrimaryKeyRelatedField(read_only=True)
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Process
        fields = ('url',
                  'id',
                  'name',
                  'code',
                  'processgroup',
                  'flow_count')


class ProcessListSerializer(ProcessSerializer):
    class Meta(ProcessSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',
                  'processgroup',
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
    process = PrimaryKeyRelatedField(read_only=True)
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
                  'process',
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
                  'process',
                  'identifier',
                  'company',
                  'postcode',
                  'address',
                  'city',
                  'country',
                  'publication',
                  'flow_count')