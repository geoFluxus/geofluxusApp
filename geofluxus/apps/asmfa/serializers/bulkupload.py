from geofluxus.apps.utils.serializers import (BulkSerializerMixin,
                                              Reference,
                                              ErrorMask,
                                              ValidationError)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor,
                                         PublicationType,
                                         Publication,
                                         ProcessGroup,
                                         Process,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         Material,
                                         Product,
                                         Composite,
                                         Year,
                                         Month,
                                         FlowChain,
                                         Flow,
                                         Classification,
                                         ExtraDescription,
                                         Routing,
                                         AdminLevel,
                                         Area)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer,
                                              ActivitySerializer,
                                              CompanySerializer,
                                              ActorSerializer,
                                              PublicationTypeSerializer,
                                              PublicationSerializer,
                                              ProcessGroupSerializer,
                                              ProcessSerializer,
                                              Waste02Serializer,
                                              Waste04Serializer,
                                              Waste06Serializer,
                                              MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer,
                                              YearSerializer,
                                              MonthSerializer,
                                              FlowChainSerializer,
                                              FlowSerializer,
                                              ClassificationSerializer,
                                              ExtraDescriptionSerializer,
                                              RoutingSerializer,
                                              AdminLevelSerializer,
                                              AreaSerializer)
import pandas as pd
from django.utils.translation import ugettext as _


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
    index_columns = ['nace']

    def get_queryset(self):
        return Activity.objects.all()


class CompanyCreateSerializer(BulkSerializerMixin,
                              CompanySerializer):
    field_map = {
        'name': 'name',
        'identifier': 'identifier'
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return Company.objects.all()


class ActorCreateSerializer(BulkSerializerMixin,
                            ActorSerializer):
    field_map = {
        'wkt': 'geom',
        'activity': Reference(name='activity',
                              referenced_field='nace',
                              referenced_model=Activity,
                              allow_null=True),
        'process': Reference(name='process',
                             referenced_field='code',
                             referenced_model=Process,
                             allow_null=True),
        'identifier': 'identifier',
        'company': Reference(name='company',
                             referenced_field='identifier',
                             referenced_model=Company),
        'postcode': 'postcode',
        'address': 'address',
        'city': 'city',
        'country': 'country',
        'publication': Reference(name='publication',
                                 referenced_field='citekey',
                                 referenced_model=Publication)
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return Actor.objects.all()

    def validate(self, attrs):
        df = attrs['dataframe']

        # activity & process cannot be both nan!
        both_nan = pd.isnull(df['activity']) == (pd.isnull(df['process']))
        if both_nan.sum() > 0:
            message = _("Actor should belong to either activity or process.")
            error_mask = ErrorMask(df)
            error_mask.set_error(df.index[both_nan], 'activity', message)
            fn, url = error_mask.to_file(
                file_type=self.input_file_ext.replace('.', ''),
                encoding=self.encoding
            )
            raise ValidationError(
                message, url
            )
        return super().validate(attrs)


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


class ProcessGroupCreateSerializer(BulkSerializerMixin,
                                   ProcessGroupSerializer):
    field_map = {
        'name': 'name',
        'code': 'code'
    }
    index_columns = ['code']

    def get_queryset(self):
        return ProcessGroup.objects.all()


class ProcessCreateSerializer(BulkSerializerMixin,
                              ProcessSerializer):
    field_map = {
        'name': 'name',
        'code': 'code',
        'processgroup': Reference(name='processgroup',
                                  referenced_field='code',
                                  referenced_model=ProcessGroup)
    }
    index_columns = ['code']

    def get_queryset(self):
        return Process.objects.all()


class Waste02CreateSerializer(BulkSerializerMixin,
                              Waste02Serializer):
    field_map = {
        'ewc_name': 'ewc_name',
        'ewc_code': 'ewc_code'
    }
    index_columns = ['ewc_code']

    def get_queryset(self):
        return Waste02.objects.all()


class Waste04CreateSerializer(BulkSerializerMixin,
                             Waste04Serializer):
    field_map = {
        'ewc_name': 'ewc_name',
        'ewc_code': 'ewc_code',
        'waste02': Reference(name='waste02',
                             referenced_field='ewc_code',
                             referenced_model=Waste02),
    }
    index_columns = ['ewc_code']

    def get_queryset(self):
        return Waste04.objects.all()


class Waste06CreateSerializer(BulkSerializerMixin,
                              Waste06Serializer):
    field_map = {
        'ewc_name': 'ewc_name',
        'ewc_code': 'ewc_code',
        'hazardous': 'hazardous',
        'waste04': Reference(name='waste04',
                             referenced_field='ewc_code',
                             referenced_model=Waste04),
    }
    index_columns = ['ewc_code']

    def get_queryset(self):
        return Waste06.objects.all()


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


class YearCreateSerializer(BulkSerializerMixin,
                           YearSerializer):
    field_map = {
        'code': 'code'
    }
    index_columns = ['code']

    def get_queryset(self):
        return Year.objects.all()


class MonthCreateSerializer(BulkSerializerMixin,
                            MonthSerializer):
    field_map = {
        'code': 'code',
        'year': Reference(name='year',
                          referenced_field='code',
                          referenced_model=Year),
    }
    index_columns = ['code', 'year']

    def get_queryset(self):
        return Month.objects.all()


class FlowChainCreateSerializer(BulkSerializerMixin,
                                FlowChainSerializer):
    field_map = {
        'identifier': 'identifier',
        'route': 'route',
        'collector': 'collector',
        'description': 'description',
        'amount': 'amount',
        'trips': 'trips',
        'month': Reference(name='month',
                           referenced_field='code',
                           referenced_model=Month),
        'waste': Reference(name='waste06',
                           referenced_field='ewc_code',
                           referenced_model=Waste06),
        'materials': Reference(name='materials',
                               referenced_field='name',
                               referenced_model=Material,
                               many=True,
                               allow_null=True),
        'products': Reference(name='products',
                              referenced_field='name',
                              referenced_model=Product,
                              many=True,
                              allow_null=True),
        'composites': Reference(name='composites',
                                referenced_field='name',
                                referenced_model=Composite,
                                many=True,
                                allow_null=True),
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
        'flowchain': Reference(name='flowchain',
                               referenced_field='identifier',
                               referenced_model=FlowChain),
        'origin': Reference(name='origin',
                            referenced_field='identifier',
                            referenced_model=Actor),
        'destination': Reference(name='destination',
                                 referenced_field='identifier',
                                 referenced_model=Actor),
        'origin_role': 'origin_role',
        'destination_role': 'destination_role'
    }
    index_columns = ['flowchain', 'origin', 'destination']

    def get_queryset(self):
        return Flow.objects.all()

    def validate(self, attrs):
        df = attrs['dataframe']

        # allowed role values: 'production' & 'treatment'
        allowed = ['production', 'treatment']
        origin = df['origin_role'].isin(allowed)
        destination = df['destination_role'].isin(allowed)
        errors = origin & destination == False # at least one is not allowed
        if errors.sum() > 0:
            message = _("Actor role should be either 'production' or 'treatment'.")
            error_mask = ErrorMask(df)
            error_mask.set_error(df.index[errors], 'origin_role', message)
            fn, url = error_mask.to_file(
                file_type=self.input_file_ext.replace('.', ''),
                encoding=self.encoding
            )
            raise ValidationError(
                message, url
            )
        return super().validate(attrs)


class ClassificationCreateSerializer(BulkSerializerMixin,
                                     ClassificationSerializer):
    field_map = {
        'flowchain': Reference(name='flowchain',
                               referenced_field='identifier',
                               referenced_model=FlowChain),
        'clean': 'clean',
        'mixed': 'mixed',
        'direct_use': 'direct_use',
        'is_composite': 'composite'
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
    index_columns = ['flowchain', 'type']

    def get_queryset(self):
        return ExtraDescription.objects.all()


class RoutingCreateSerializer(BulkSerializerMixin,
                              RoutingSerializer):
    field_map = {
        'origin': Reference(name='origin',
                            referenced_field='identifier',
                            referenced_model=Actor),
        'destination': Reference(name='destination',
                                 referenced_field='identifier',
                                 referenced_model=Actor),
        'wkt': 'geom'
    }
    index_columns = ['origin', 'destination']

    def get_queryset(self):
        return Routing.objects.all()


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
        'name': 'name',
        'code': 'code',
        'wkt': 'geom',
        'level': Reference(name='adminlevel',
                           referenced_field='level',
                           referenced_model=AdminLevel),
        'parent': Reference(name='parent_area',
                            referenced_field='name',
                            referenced_model=Area,
                            allow_null=True),
        'inhabitants': 'inhabitants',
        'publication': Reference(name='publication',
                                 referenced_field='citekey',
                                 referenced_model=Publication,
                                 allow_null=True)
    }
    index_columns = ['name']

    def get_queryset(self):
        return Area.objects.all()