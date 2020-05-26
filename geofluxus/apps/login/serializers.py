from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from rest_framework.relations import HyperlinkedIdentityField
from geofluxus.apps.login.models import UserFilter, User


# User
# class UserSerializer(HyperlinkedModelSerializer):
#     url = HyperlinkedIdentityField(view_name="myapp:user-detail")
#
#     class Meta:
#         model = User
#         fields = ('url',
#                   'id',
#                   'username')


# class UserListSerializer(HyperlinkedModelSerializer):
#     class Meta:
#         model = User
#         fields = ('id',
#                   'username')


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