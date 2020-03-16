from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         Routing)
from geofluxus.apps.asmfa.serializers import (MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer)
from rest_framework_gis.serializers import (GeometryField)


# FlowChain
class FlowChainSerializer(HyperlinkedModelSerializer):
    process = PrimaryKeyRelatedField(read_only=True)
    waste = PrimaryKeyRelatedField(read_only=True)
    materials = MaterialSerializer(read_only=True, many=True)
    products = ProductSerializer(read_only=True, many=True)
    composites = CompositeSerializer(read_only=True, many=True)
    publication = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = FlowChain
        fields = ('url',
                  'id',
                  'identifier',
                  'route',
                  'collector',
                  'description',
                  'amount',
                  'trips',
                  'month',
                  'process',
                  'waste06',
                  'materials',
                  'products',
                  'composites',
                  'publication')


class FlowChainListSerializer(FlowChainSerializer):
    class Meta(FlowChainSerializer.Meta):
        fields = ('id',
                  'identifier',
                  'route',
                  'collector',
                  'description',
                  'amount',
                  'trips',
                  'month',
                  'process',
                  'waste06',
                  'materials',
                  'products',
                  'composites',
                  'publication')


# Flow
class FlowSerializer(HyperlinkedModelSerializer):
    flowchain = PrimaryKeyRelatedField(read_only=True)
    origin = PrimaryKeyRelatedField(read_only=True)
    destination = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Flow
        fields = ('url',
                  'id',
                  'flowchain',
                  'origin',
                  'destination',
                  'origin_role',
                  'destination_role')


class FlowListSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        fields = ('id',
                  'flowchain',
                  'origin',
                  'destination',
                  'origin_role',
                  'destination_role')


# Classification
class ClassificationSerializer(HyperlinkedModelSerializer):
    flowchain = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Classification
        fields = ('url',
                  'id',
                  'flowchain',
                  'clean',
                  'mixed',
                  'direct_use',
                  'composite')


class ClassificationListSerializer(ClassificationSerializer):
    class Meta(ClassificationSerializer.Meta):
        fields = ('id',
                  'flowchain',
                  'clean',
                  'mixed',
                  'direct_use',
                  'composite')


# ExtraDescription
class ExtraDescriptionSerializer(HyperlinkedModelSerializer):
    flowchain = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ExtraDescription
        fields = ('url',
                  'id',
                  'flowchain',
                  'type',
                  'description')


class ExtraDescriptionListSerializer(ExtraDescriptionSerializer):
    class Meta(ExtraDescriptionSerializer.Meta):
        fields = ('id',
                  'flowchain',
                  'type',
                  'description')


# Routing
class RoutingSerializer(HyperlinkedModelSerializer):
    origin = PrimaryKeyRelatedField(read_only=True)
    destination = PrimaryKeyRelatedField(read_only=True)
    geom = GeometryField()

    class Meta:
        model = Routing
        geo_field = 'geom'
        fields = ('url',
                  'id',
                  'origin',
                  'destination',
                  'geom')


class RoutingListSerializer(RoutingSerializer):
    class Meta(RoutingSerializer.Meta):
        fields = ('id',
                  'origin',
                  'destination',
                  'geom')