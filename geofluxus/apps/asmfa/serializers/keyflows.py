from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField)
from geofluxus.apps.asmfa.models import (Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite)


# Process
class ProcessSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Process
        fields = ('url',
                  'id',
                  'name',
                  'code')


class ProcessListSerializer(ProcessSerializer):
    class Meta(ProcessSerializer.Meta):
        fields = ('id',
                  'name',
                  'code')


# Waste
class WasteSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Waste
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous')


class WasteListSerializer(WasteSerializer):
    class Meta(WasteSerializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous')


# Material
class MaterialSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Material
        fields = ('url',
                  'id',
                  'name')


class MaterialListSerializer(MaterialSerializer):
    class Meta(MaterialSerializer.Meta):
        fields = ('id',
                  'name')


# Product
class ProductSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = ('url',
                  'id',
                  'name')


class ProductListSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ('id',
                  'name')


# Composite
class CompositeSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Composite
        fields = ('url',
                  'id',
                  'name')


class CompositeListSerializer(CompositeSerializer):
    class Meta(CompositeSerializer.Meta):
        fields = ('id',
                  'name')