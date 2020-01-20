from geofluxus.apps.utils.serializers import (BulkSerializerMixin,
                                              Reference)
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
        'activitygroup': Reference(name='activitygroup',
                                   referenced_field='code',
                                   referenced_model=ActivityGroup)
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
        'activity': Reference(name='activity',
                              referenced_field='nace',
                              referenced_model=Activity),
        'identifier': 'identifier',
        'company': Reference(name='company',
                             referenced_field='identifier',
                             referenced_model=Company),
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
        'publicationtype': Reference(name='publicationtype',
                                     referenced_field='name',
                                     referenced_model=PublicationType),
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
        'process': Reference(name='process',
                             referenced_field='name',
                             referenced_model=Process),
        'waste': Reference(name='waste',
                           referenced_field='ewc_name',
                           referenced_model=Waste),
        'materials': Reference(name='materials',
                               referenced_field='name',
                               referenced_model=Material),
        'products': Reference(name='products',
                              referenced_field='name',
                              referenced_model=Product),
        'composites': Reference(name='composites',
                                referenced_field='name',
                                referenced_model=Composite),
        'publication': Reference(name='publication',
                                 referenced_field='citekey',
                                 referenced_model=Publication)
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return FlowChain.objects.all()


class FlowCreateSerializer(BulkSerializerMixin,
                           FlowSerializer):
    field_map = {
        'flowchain': 'flowchain',
        'origin': Reference(name='origin',
                            referenced_field='identifier',
                            referenced_model=Actor),
        'destination': Reference(name='destination',
                                 referenced_field='identifier',
                                 referenced_model=Actor),
        'origin_role': 'origin_role',
        'destination_role': 'destination_role'
    }
    index_columns = ['origin', 'destination']

    def get_queryset(self):
        return Flow.objects.all()


class ClassificationCreateSerializer(BulkSerializerMixin,
                                     ClassificationSerializer):
    field_map = {
        'flowchain': Reference(name='flowchain',
                               referenced_field='identifier',
                               referenced_model=FlowChain),
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
        'flowchain': Reference(name='flowchain',
                               referenced_field='identifier',
                               referenced_model=FlowChain),
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
        'adminlevel': Reference(name='adminlevel',
                                referenced_field='level',
                                referenced_model=AdminLevel),
        'name': 'name',
        'code': 'code',
        'geom': 'geom',
        'parent_area': Reference(name='parent_area',
                                 referenced_field='code',
                                 referenced_model=Area),
        'inhabitants': 'inhabitants',
        'publication': Reference(name='publication',
                                 referenced_field='citekey',
                                 referenced_model=Publication)
    }
    index_columns = ['name']

    def get_queryset(self):
        return Area.objects.all()