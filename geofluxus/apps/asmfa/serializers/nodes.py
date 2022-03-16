from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from rest_framework_gis.serializers import (GeometryField)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
                                         Company,
                                         Actor)


# Activity group
class ActivityGroupSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ActivityGroup
        fields = ('url',
                  'id',
                  'name',
                  'code',)


class ActivityGroupListSerializer(ActivityGroupSerializer):
    class Meta(ActivityGroupSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',)


# Activity
class ActivitySerializer(HyperlinkedModelSerializer):
    activitygroup = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Activity
        fields = ('url',
                  'id',
                  'name',
                  'nace',
                  'activitygroup',)


class ActivityListSerializer(ActivitySerializer):
    class Meta(ActivitySerializer.Meta):
        fields = ('id',
                  'name',
                  'nace',
                  'activitygroup')


# Process group
class ProcessGroupSerializer(HyperlinkedModelSerializer):

    class Meta:
        model = ProcessGroup
        fields = ('url',
                  'id',
                  'name',
                  'co2')

class ProcessGroupListSerializer(ProcessGroupSerializer):
    class Meta(ProcessGroupSerializer.Meta):
        fields = ('id',
                  'name',
                  'co2')


# Process
class ProcessSerializer(HyperlinkedModelSerializer):
    processgroup = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Process
        fields = ('url',
                  'id',
                  'name',
                  'code',
                  'processgroup',)


class ProcessListSerializer(ProcessSerializer):
    class Meta(ProcessSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',
                  'processgroup',)


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
        fields = ('id',
                  'name',)
