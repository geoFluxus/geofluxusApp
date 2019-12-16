from geofluxus.apps.utils.serializers import (BulkSerializerMixin)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor,
                                         PublicationType,
                                         Publication,
                                         Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite,
                                         FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         AdminLevel,
                                         Area)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer,
                                              ActivitySerializer,
                                              CompanySerializer,
                                              ActorSerializer,
                                              PublicationTypeSerializer,
                                              PublicationSerializer,
                                              ProcessSerializer,
                                              WasteSerializer,
                                              MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer,
                                              FlowChainSerializer,
                                              FlowSerializer,
                                              ClassificationSerializer,
                                              ExtraDescriptionSerializer,
                                              AdminLevelSerializer,
                                              AreaSerializer)


class ActivityGroupCreateSerializer(BulkSerializerMixin,
                                    ActivityGroupSerializer):
    field_map = {
        'code': 'code',
        'name': 'name'
    }
    index_columns = ['code']

    def get_queryset(self):
        return ActivityGroup.objects.all()


class ActivityCreateSerializer(BulkSerializerMixin,
                               ActivitySerializer):
    field_map = {
        'name': 'name',
        'nace': 'nace',
        'activitygroup': 'activitygroup'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Activity.objects.all()


class CompanyCreateSerializer(BulkSerializerMixin,
                              CompanySerializer):
    field_map = {
        'name': 'name',
        'identifier': 'identifier'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Company.objects.all()


class ActorCreateSerializer(BulkSerializerMixin,
                            ActorSerializer):
    field_map = {
        'name': 'name',
        'geom': 'geom',
        'activity': 'activity',
        'identifier': 'identifier',
        'company': 'company',
        'postcode': 'postcode',
        'address': 'address',
        'city': 'city',
        'country': 'country',
        'publication': 'publication'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Actor.objects.all()


class PublicationTypeCreateSerializer(BulkSerializerMixin,
                                      PublicationTypeSerializer):
    field_map = {
        'name': 'name'
    }
    index_columns = ['name']

    def get_queryset(self):
        return PublicationType.objects.all()


class PublicationCreateSerializer(BulkSerializerMixin,
                                  PublicationSerializer):
    field_map = {
        'citekey': 'citekey',
        'author': 'author',
        'note': 'note',
        'title': 'title',
        'publicationtype': 'publicationtype',
        'url': 'url',
        'file_url': 'file_url'
    }
    index_columns = ['citekey']

    def get_queryset(self):
        return Publication.objects.all()


class ProcessCreateSerializer(BulkSerializerMixin,
                              ProcessSerializer):
    field_map = {
        'name': 'name',
        'code': 'code'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Process.objects.all()


class WasteCreateSerializer(BulkSerializerMixin,
                            WasteSerializer):
    field_map = {
        'ewc_name': 'ewc_name',
        'ewc_code': 'ewc_code',
        'hazardous': 'hazardous'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Waste.objects.all()


class MaterialCreateSerializer(BulkSerializerMixin,
                               MaterialSerializer):
    field_map = {
        'name': 'name'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Material.objects.all()


class ProductCreateSerializer(BulkSerializerMixin,
                              ProductSerializer):
    field_map = {
        'name': 'name'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Product.objects.all()


class CompositeCreateSerializer(BulkSerializerMixin,
                                CompositeSerializer):
    field_map = {
        'name': 'name'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Composite.objects.all()


class FlowChainCreateSerializer(BulkSerializerMixin,
                                FlowChainSerializer):
    field_map = {
        'identifier': 'identifier',
        'route': 'route',
        'collector': 'collector',
        'description': 'description',
        'amount': 'amount',
        'trips': 'trips',
        'year': 'year',
        'process': 'process',
        'waste': 'waste',
        'materials': 'materials',
        'products': 'products',
        'composites': 'composites',
        'publication': 'publication'
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return FlowChain.objects.all()


class FlowCreateSerializer(BulkSerializerMixin,
                           FlowSerializer):
    field_map = {
        'flowchain': 'flowchain',
        'origin': 'origin',
        'destination': 'destination',
        'origin_role': 'origin_role',
        'destination_role': 'destination_role'
    }
    index_columns = ['origin', 'destination']

    def get_queryset(self):
        return Flow.objects.all()


class ClassificationCreateSerializer(BulkSerializerMixin,
                                     ClassificationSerializer):
    field_map = {
        'flowchain': 'flowchain',
        'clean': 'clean',
        'mixed': 'mixed',
        'direct_use': 'direct_use'
    }
    index_columns = ['flowchain']

    def get_queryset(self):
        return Classification.objects.all()


class ExtraDescriptionCreateSerializer(BulkSerializerMixin,
                                       ExtraDescriptionSerializer):
    field_map = {
        'flowchain': 'flowchain',
        'type': 'type',
        'description': 'description'
    }
    index_columns = ['flowchain']

    def get_queryset(self):
        return ExtraDescription.objects.all()


class AdminLevelCreateSerializer(BulkSerializerMixin,
                                 AdminLevelSerializer):
    field_map = {
        'name': 'name',
        'level': 'level'
    }
    index_columns = ['name']

    def get_queryset(self):
        return AdminLevel.objects.all()


class AreaCreateSerializer(BulkSerializerMixin,
                           AreaSerializer):
    field_map = {
        'adminlevel': 'adminlevel',
        'name': 'name',
        'code': 'code',
        'geom': 'geom',
        'parent_area': 'parent_area',
        'inhabitants': 'inhabitants',
        'publication': 'publication'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Area.objects.all()