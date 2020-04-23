from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (Ways)
from rest_framework_gis.serializers import (GeometryField)


class WaysSerializer(HyperlinkedModelSerializer):
    the_geom = GeometryField()

    class Meta:
        model = Ways
        geo_field = 'the_geom'
        fields = ('id',
                  'the_geom')

class WaysListSerializer(WaysSerializer):
    class Meta(WaysSerializer.Meta):
        fields = ('id',
                  'the_geom')