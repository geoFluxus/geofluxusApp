from geofluxus.apps.utils.serializers import (BulkSerializerMixin,
                                              Reference,
                                              ErrorMask,
                                              ValidationError)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor,
                                         DatasetType,
                                         Dataset,
                                         ProcessGroup,
                                         Process,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         GNcode,
                                         TreatmentEmission,
                                         Year,
                                         Month,
                                         FlowChain,
                                         Flow,
                                         Routing,
                                         AdminLevel,
                                         Area,
                                         Vehicle)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer,
                                              ActivitySerializer,
                                              CompanySerializer,
                                              ActorSerializer,
                                              DatasetTypeSerializer,
                                              DatasetSerializer,
                                              ProcessGroupSerializer,
                                              ProcessSerializer,
                                              Waste02Serializer,
                                              Waste04Serializer,
                                              Waste06Serializer,
                                              GNcodeSerializer,
                                              TreatmentEmissionSerializer,
                                              YearSerializer,
                                              MonthSerializer,
                                              FlowChainSerializer,
                                              FlowSerializer,
                                              RoutingSerializer,
                                              AdminLevelSerializer,
                                              AreaSerializer,
                                              VehicleSerializer)
from geofluxus.apps.fileshare.models import (SharedFile)
from geofluxus.apps.fileshare.serializers import (SharedFileSerializer)
import pandas as pd
from django.utils.translation import gettext_lazy as _


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
        'dataset': Reference(name='dataset',
                             referenced_field='citekey',
                             referenced_model=Dataset)
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return Actor.objects.all()

    def validate(self, attrs):
        df = attrs['dataframe']

        # activity & process cannot be both nan!
        if all(x in df.columns for x in ['activity', 'process']):
            both_nan = pd.isnull(df['activity']) & pd.isnull(df['process'])
            if len(df[both_nan].index) > 0:
                message = _("Actor should belong to either activity or process.")
                error_mask = ErrorMask(df)
                error_mask.set_error(df.index[both_nan], 'activity', message)
                response = error_mask.to_file(
                    file_type=self.input_file_ext.replace('.', ''),
                    encoding=self.encoding
                )
                raise ValidationError(
                    response
                )
        return super().validate(attrs)


class DatasetTypeCreateSerializer(BulkSerializerMixin,
                                  DatasetTypeSerializer):
    field_map = {
        'name': 'name'
    }
    index_columns = ['name']

    def get_queryset(self):
        return DatasetType.objects.all()


class DatasetCreateSerializer(BulkSerializerMixin,
                              DatasetSerializer):
    field_map = {
        'citekey': 'citekey',
        'author': 'author',
        'note': 'note',
        'title': 'title',
        'datasettype': Reference(name='datasettype',
                                 referenced_field='name',
                                 referenced_model=DatasetType),
        'url': 'url',
        'file_url': 'file_url'
    }
    index_columns = ['citekey']

    def get_queryset(self):
        return Dataset.objects.all()


class ProcessGroupCreateSerializer(BulkSerializerMixin,
                                   ProcessGroupSerializer):
    field_map = {
        'name': 'name',
        'co2': 'co2'
    }
    index_columns = ['name']

    def get_queryset(self):
        return ProcessGroup.objects.all()


class ProcessCreateSerializer(BulkSerializerMixin,
                              ProcessSerializer):
    field_map = {
        'name': 'name',
        'code': 'code',
        'processgroup': Reference(name='processgroup',
                                  referenced_field='name',
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
        'materials': 'materials',
        'industries': 'industries',
        'agendas': 'agendas',
        'chains': 'chains',
        'clean': 'clean',
        'mixed': 'mixed'
    }
    index_columns = ['ewc_code']

    def get_queryset(self):
        return Waste06.objects.all()


class GNcodeCreateSerializer(BulkSerializerMixin,
                             GNcodeSerializer):
    field_map = {
        'name': 'name',
        'code': 'code'
    }
    index_columns = ['code']

    def get_queryset(self):
        return GNcode.objects.all()


class TreatmentEmissionCreateSerializer(BulkSerializerMixin,
                                        TreatmentEmissionSerializer):
    field_map = {
        'waste': Reference(name='waste06',
                           referenced_field='ewc_code',
                           referenced_model=Waste06),
        'processgroup': Reference(name='processgroup',
                                  referenced_field='name',
                                  referenced_model=ProcessGroup),
        'co2': 'co2'
    }
    index_columns = ['waste', 'processgroup']

    def get_queryset(self):
        return TreatmentEmission.objects.all()


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
                           referenced_model=Waste06,
                           allow_null=True),
        'gncode': Reference(name='gncode',
                            referenced_field='code',
                            referenced_model=GNcode,
                            allow_null=True),
        'dataset': Reference(name='dataset',
                             referenced_field='citekey',
                             referenced_model=Dataset)
    }
    index_columns = ['identifier']

    def get_queryset(self):
        return FlowChain.objects.all()

    def validate(self, attrs):
        df = attrs['dataframe']

        # activity & process cannot be both nan!
        if all(x in df.columns for x in ['waste', 'gncode']):
            both_nan = pd.isnull(df['waste']) & (pd.isnull(df['gncode']))
            if len(df[both_nan].index) > 0:
                message = _("Flowchain should have either EWC or GN code.")
                error_mask = ErrorMask(df)
                error_mask.set_error(df.index[both_nan], 'waste', message)
                response = error_mask.to_file(
                    file_type=self.input_file_ext.replace('.', ''),
                    encoding=self.encoding
                )
                raise ValidationError(
                    response
                )
        return super().validate(attrs)


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


class RoutingCreateSerializer(BulkSerializerMixin,
                              RoutingSerializer):
    field_map = {
        'origin': Reference(name='origin',
                            referenced_field='identifier',
                            referenced_model=Actor),
        'destination': Reference(name='destination',
                                 referenced_field='identifier',
                                 referenced_model=Actor),
        'wkt': 'geom',
        'seq': 'seq'
    }
    index_columns = ['origin', 'destination']

    def get_queryset(self):
        return Routing.objects.all()


class AdminLevelCreateSerializer(BulkSerializerMixin,
                                 AdminLevelSerializer):
    field_map = {
        'name': 'name',
        'level': 'level',
        'resolution': 'resolution'
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
        'dataset': Reference(name='dataset',
                             referenced_field='citekey',
                             referenced_model=Dataset,
                             allow_null=True)
    }
    index_columns = ['code']

    def get_queryset(self):
        return Area.objects.all()


class VehicleCreateSerializer(BulkSerializerMixin,
                              VehicleSerializer):
    field_map = {
        'name': 'name',
        'min': 'min',
        'max': 'max',
        'co2': 'co2',
        'nox': 'nox',
        'so2': 'so2',
        'pm10': 'pm10'
    }
    index_columns = ['name']

    def get_queryset(self):
        return Vehicle.objects.all()


class SharedFileCreateSerializer(BulkSerializerMixin,
                                 SharedFileSerializer):
    field_map = {
        'name': 'name',
        'type': 'type',
        'url': 'url',
        'dataset': Reference(name='dataset',
                             referenced_field='citekey',
                             referenced_model=Dataset,
                             allow_null=True)
    }
    index_columns = ['name']

    def get_queryset(self):
        return SharedFile.objects.all()