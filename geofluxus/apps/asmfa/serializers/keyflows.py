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


# Waste
class WasteSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Waste
        fields = ('url',
                  'id',
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


# Product
class ProductSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = ('url',
                  'id',
                  'name')


# Composite
class CompositeSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Composite
        fields = ('url',
                  'id',
                  'name')