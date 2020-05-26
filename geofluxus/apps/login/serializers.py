from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.login.models import UserFilter


# User filters
class UserFilterSerializer(HyperlinkedModelSerializer):
    user = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserFilter
        fields = ('url',
                  'id',
                  'user',
                  'filter')


class UserFilterListSerializer(UserFilterSerializer):
    class Meta(UserFilterSerializer.Meta):
        fields = ('id',
                  'user',
                  'filter')