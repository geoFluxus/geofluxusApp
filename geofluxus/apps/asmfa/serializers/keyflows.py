from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        IntegerField,
                                        PrimaryKeyRelatedField,)
from geofluxus.apps.asmfa.models import (Waste02,
                                         Waste04,
                                         Waste06,
                                         Material,
                                         Product,
                                         Composite,
                                         Year,
                                         Month)


# Waste02
class Waste02Serializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Waste02
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'flow_count')


class Waste02ListSerializer(Waste02Serializer):
    class Meta(Waste02Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'flow_count')

# Waste04
class Waste04Serializer(HyperlinkedModelSerializer):
    waste02 = PrimaryKeyRelatedField(read_only=True)
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Waste04
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'waste02',
                  'flow_count')

class Waste04ListSerializer(Waste04Serializer):
    class Meta(Waste04Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'waste02',
                  'flow_count')

# Waste06
class Waste06Serializer(HyperlinkedModelSerializer):
    waste04 = PrimaryKeyRelatedField(read_only=True)
    flow_count = IntegerField(read_only=True)

    class Meta:
        model =  Waste06
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'waste04',
                  'flow_count')

class Waste06ListSerializer(Waste06Serializer):
    class Meta(Waste06Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'waste04',
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


# Year
class YearSerializer(HyperlinkedModelSerializer):
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Year
        fields = ('url',
                  'id',
                  'code',
                  'flow_count')

class YearListSerializer(YearSerializer):
    class Meta(YearSerializer.Meta):
        fields = ('id',
                  'code',
                  'flow_count')


# Month
class MonthSerializer(HyperlinkedModelSerializer):
    year = PrimaryKeyRelatedField(read_only=True)
    flow_count = IntegerField(read_only=True)

    class Meta:
        model = Month
        fields = ('url',
                  'id',
                  'code',
                  'year',
                  'flow_count')

class MonthListSerializer(MonthSerializer):
    class Meta(MonthSerializer.Meta):
        fields = ('id',
                  'code',
                  'year',
                  'flow_count')