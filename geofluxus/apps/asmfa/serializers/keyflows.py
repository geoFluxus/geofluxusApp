from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        IntegerField)
from geofluxus.apps.asmfa.models import (Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite)


# Process
class ProcessSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Process
        fields = ('url',
                  'id',
                  'name',
                  'code',
                  'flow_count')


class ProcessListSerializer(ProcessSerializer):
    class Meta(ProcessSerializer.Meta):
        fields = ('id',
                  'name',
                  'code',
                  'flow_count')


# Waste
class WasteSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Waste
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'flow_count')


class WasteListSerializer(WasteSerializer):
    class Meta(WasteSerializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'flow_count')


# Material
class MaterialSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Material
        fields = ('url',
                  'id',
                  'name',
                  'flow_count')


class MaterialListSerializer(MaterialSerializer):
    class Meta(MaterialSerializer.Meta):
        fields = ('id',
                  'name',
                  'flow_count')


# Product
class ProductSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = ('url',
                  'id',
                  'name',
                  'flow_count')


class ProductListSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ('id',
                  'name',
                  'flow_count')


# Composite
class CompositeSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Composite
        fields = ('url',
                  'id',
                  'name',
                  'flow_count')


class CompositeListSerializer(CompositeSerializer):
    class Meta(CompositeSerializer.Meta):
        fields = ('id',
                  'name',
                  'flow_count')