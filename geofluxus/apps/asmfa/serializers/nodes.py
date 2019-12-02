from rest_framework import serializers
from geofluxus.apps.asmfa.models import (ActivityGroup)


# Activity group
class ActivityGroupSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = ActivityGroup
        fields = ('id', 'name', 'code')