from rest_framework.serializers import (HyperlinkedModelSerializer,
                                        PrimaryKeyRelatedField,
                                        CharField,
                                        SlugRelatedField)
from geofluxus.apps.asmfa.models import (FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription)
from geofluxus.apps.asmfa.serializers import (MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer,
                                              ProcessSerializer)


# FlowChain
class FlowChainSerializer(HyperlinkedModelSerializer):
    process = CharField(source='process.name',
                        read_only=True)
    waste = CharField(source='waste.ewc_code',
                      read_only=True)
    materials = SlugRelatedField(slug_field='name',
                                 read_only=True,
                                 many=True)
    products = SlugRelatedField(slug_field='name',
                                read_only=True,
                                many=True)
    composites = SlugRelatedField(slug_field='name',
                                  read_only=True,
                                  many=True)
    publication = CharField(source='publication.citekey',
                            read_only=True)

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
                  'year',
                  'process',
                  'waste',
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
                  'year',
                  'process',
                  'waste',
                  'materials',
                  'products',
                  'composites',
                  'publication')


# Flow
class FlowSerializer(HyperlinkedModelSerializer):
    flowchain = CharField(source='flowchain.identifier',
                          read_only=True)
    origin = CharField(source='origin.identifier',
                       read_only=True)
    destination = CharField(source='destination.identifier',
                            read_only=True)

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
                  'direct_use')


class ClassificationListSerializer(ClassificationSerializer):
    class Meta(ClassificationSerializer.Meta):
        fields = ('id',
                  'flowchain',
                  'clean',
                  'mixed',
                  'direct_use')


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