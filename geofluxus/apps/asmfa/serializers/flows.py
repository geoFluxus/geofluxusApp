from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Routing,
                                         Vehicle)
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
                  'nox',
                  'so2',
                  'pm10')


class VehicleListSerializer(VehicleSerializer):
    class Meta(VehicleSerializer.Meta):
        fields = ('id',
                  'name',
                  'min',
                  'max',
                  'co2',
                  'nox',
                  'so2',
                  'pm10')


# FlowChain
class FlowChainSerializer(HyperlinkedModelSerializer):
    waste = PrimaryKeyRelatedField(read_only=True)
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