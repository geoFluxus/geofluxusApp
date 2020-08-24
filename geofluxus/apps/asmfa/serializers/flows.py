from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         Routing,
                                         Vehicle)
from geofluxus.apps.asmfa.serializers import (MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer)
from rest_framework_gis.serializers import (GeometryField)


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
                  'geom',
                  'seq',
                  'distance')


class RoutingListSerializer(RoutingSerializer):
    class Meta(RoutingSerializer.Meta):
        fields = ('id',
                  'origin',
                  'destination',
                  'geom',
                  'seq',
                  'distance')


# Vehicle
class VehicleSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Vehicle
        fields = ('id',
                  'name',
                  'min',
                  'max',
                  'co2',
                  'nox')


class VehicleListSerializer(VehicleSerializer):
    class Meta(VehicleSerializer.Meta):
        fields = ('id',
                  'name',
                  'min',
                  'max',
                  'co2',
                  'nox')


# FlowChain
class FlowChainSerializer(HyperlinkedModelSerializer):
    waste = PrimaryKeyRelatedField(read_only=True)
    materials = MaterialSerializer(read_only=True, many=True)
    products = ProductSerializer(read_only=True, many=True)
    composites = CompositeSerializer(read_only=True, many=True)
    dataset = PrimaryKeyRelatedField(read_only=True)

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
                  'waste06',
                  'materials',
                  'products',
                  'composites',
                  'dataset')


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
                  'waste06',
                  'materials',
                  'products',
                  'composites',
                  'dataset')


# Flow
class FlowSerializer(HyperlinkedModelSerializer):
    flowchain = PrimaryKeyRelatedField(read_only=True)
    origin = PrimaryKeyRelatedField(read_only=True)
    destination = PrimaryKeyRelatedField(read_only=True)
    routing = PrimaryKeyRelatedField(read_only=True)
    vehicle = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Flow
        fields = ('url',
                  'id',
                  'flowchain',
                  'origin',
                  'destination',
                  'origin_role',
                  'destination_role',
                  'routing',
                  'vehicle')


class FlowListSerializer(FlowSerializer):
    class Meta(FlowSerializer.Meta):
        fields = ('id',
                  'flowchain',
                  'origin',
                  'destination',
                  'origin_role',
                  'destination_role',
                  'routing',
                  'vehicle')


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