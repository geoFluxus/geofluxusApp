from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        JSONField)
from geofluxus.apps.login.models import UserFilter
import json


# User filters
class UserFilterSerializer(HyperlinkedModelSerializer):
    user = PrimaryKeyRelatedField(read_only=True)
    filter = JSONField()

    def to_representation(self, instance):
        ret = super(UserFilterSerializer, self).to_representation(instance)
        filter = ret['filter'].replace("\'", "\"")
        ret['filter'] = json.loads(filter)
        return ret

    class Meta:
        model = UserFilter
        fields = ('url',
                  'id',
                  'user',
                  'name',
                  'filter',
                  'date')


class UserFilterListSerializer(UserFilterSerializer):
    class Meta(UserFilterSerializer.Meta):
        fields = ('id',
                  'user',
                  'name',
                  'filter',
                  'date')