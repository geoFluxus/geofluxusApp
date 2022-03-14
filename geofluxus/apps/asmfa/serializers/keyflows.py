from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        IntegerField,
                                        PrimaryKeyRelatedField,)
from geofluxus.apps.asmfa.models import (Waste02,
                                         Waste04,
                                         Waste06,
                                         GNcode,
                                         Year,
                                         Month,
                                         TreatmentEmission)
from calendar import month_abbr


# Waste02
class Waste02Serializer(HyperlinkedModelSerializer):
    class Meta:
        model = Waste02
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',)


class Waste02ListSerializer(Waste02Serializer):
    class Meta(Waste02Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',)


# Waste04
class Waste04Serializer(HyperlinkedModelSerializer):
    waste02 = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Waste04
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'waste02',)


class Waste04ListSerializer(Waste04Serializer):
    class Meta(Waste04Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'waste02',)


# Waste06
class Waste06Serializer(HyperlinkedModelSerializer):
    waste04 = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Waste06
        fields = ('url',
                  'id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'waste04',
                  'materials',
                  'industries',
                  'agendas',
                  'chains',
                  'clean',
                  'mixed')


class Waste06ListSerializer(Waste06Serializer):
    class Meta(Waste06Serializer.Meta):
        fields = ('id',
                  'ewc_name',
                  'ewc_code',
                  'hazardous',
                  'waste04',
                  'materials',
                  'industries',
                  'agendas',
                  'chains',
                  'clean',
                  'mixed')


# GNcode
class GNcodeSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = GNcode
        fields = ('url',
                  'id',
                  'name',
                  'code')


class GNcodeListSerializer(GNcodeSerializer):
    class Meta(GNcodeSerializer.Meta):
        fields = ('id',
                  'name',
                  'code')


# TreatmentEmissions
class TreatmentEmissionSerializer(HyperlinkedModelSerializer):
    waste06 = PrimaryKeyRelatedField(read_only=True)
    processgroup = PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TreatmentEmission
        fields = ('url',
                  'id',
                  'waste06',
                  'processgroup',
                  'co2')

class TreatmentEmissionListSerializer(Waste06Serializer):
    class Meta(TreatmentEmissionSerializer.Meta):
        fields = ('id',
                  'waste06',
                  'processgroup',
                  'co2')


# Year
class YearSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Year
        fields = ('url',
                  'id',
                  'code',)


class YearListSerializer(YearSerializer):
    class Meta(YearSerializer.Meta):
        fields = ('id',
                  'code',)


# Month
class MonthSerializer(HyperlinkedModelSerializer):
    year = PrimaryKeyRelatedField(read_only=True)

    def to_representation(self, instance):
        ret = super(MonthSerializer, self).to_representation(instance)
        code = ret['code']
        ret['code'] = "".join([month_abbr[int(code[:2])], code[2:]])
        return ret

    class Meta:
        model = Month
        fields = ('url',
                  'id',
                  'code',
                  'year',)


class MonthListSerializer(MonthSerializer):
    class Meta(MonthSerializer.Meta):
        fields = ('id',
                  'code',
                  'year',)