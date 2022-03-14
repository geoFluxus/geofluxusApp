from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Waste02,
                                         Waste04,
                                         Waste06,
                                         GNcode,
                                         Year,
                                         Month,
                                         TreatmentEmission)
from geofluxus.apps.asmfa.serializers import (Waste02Serializer,
                                              Waste04Serializer,
                                              Waste06Serializer,
                                              GNcodeSerializer,
                                              YearSerializer,
                                              MonthSerializer,
                                              TreatmentEmissionSerializer)
from geofluxus.apps.asmfa.serializers import (Waste02ListSerializer,
                                              Waste04ListSerializer,
                                              Waste06ListSerializer,
                                              GNcodeListSerializer,
                                              YearListSerializer,
                                              MonthListSerializer,
                                              TreatmentEmissionListSerializer)
from geofluxus.apps.asmfa.serializers import (Waste02CreateSerializer,
                                              Waste04CreateSerializer,
                                              Waste06CreateSerializer,
                                              GNcodeCreateSerializer,
                                              YearCreateSerializer,
                                              MonthCreateSerializer,
                                              TreatmentEmissionCreateSerializer)
from rest_framework.response import Response
from collections import OrderedDict
import re


# Waste02
class Waste02ViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Waste02.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = Waste02Serializer
    serializers = {
        'list': Waste02ListSerializer,
        'create': Waste02CreateSerializer
    }


# Waste04
class Waste04ViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Waste04.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = Waste04Serializer
    serializers = {
        'list': Waste04ListSerializer,
        'create': Waste04CreateSerializer
    }


# Waste06
class Waste06ViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Waste06.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = Waste06Serializer
    serializers = {
        'list': Waste06ListSerializer,
        'create': Waste06CreateSerializer
    }


# Waste06 Field Viewset
class Waste06FieldViewSet(PostGetViewMixin,
                          ViewSetMixin,
                          ModelPermissionViewSet):
    field = None
    queryset = Waste06.objects.all()

    @staticmethod
    def format_name(name):
        exclude = [
            'TransitieAgenda',
            'Industrie'
        ]

        def replace(name):
            for e in exclude:
                name = name.replace(e, '')
            return name

        name = " ".join(
            re.findall('[A-Z&][^A-Z&]*', replace(name))
        ) \
            if any(char.isupper() for char in name) else name.capitalize().replace('_', ' ')
        return name

    def list(self, request, **kwargs):
        queryset = Waste06.objects.values(self.field) \
                                  .order_by(self.field) \
                                  .distinct()
        data = []
        for idx, item in enumerate(queryset):
            data.append(OrderedDict({
                'id': idx,
                'name': self.format_name(item[self.field])
            }))
        return Response(data)


# Agendas
class AgendaViewSet(Waste06FieldViewSet):
    field = 'agendas'


# Industries
class IndustryViewSet(Waste06FieldViewSet):
    field = 'industries'


# Chains
class ChainViewSet(Waste06FieldViewSet):
    field = 'chains'


# GNcode
class GNcodeViewSet(PostGetViewMixin,
                    ViewSetMixin,
                    ModelPermissionViewSet):
    queryset = GNcode.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = GNcodeSerializer
    serializers = {
        'list': GNcodeListSerializer,
        'create': GNcodeCreateSerializer
    }


# TreatmentEmission
class TreatmentEmissionViewSet(PostGetViewMixin,
                               ViewSetMixin,
                               ModelPermissionViewSet):
    queryset = TreatmentEmission.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = TreatmentEmissionSerializer
    serializers = {
        'list': TreatmentEmissionListSerializer,
        'create': TreatmentEmissionCreateSerializer
    }


# Year
class YearViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Year.objects.order_by('-code')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = YearSerializer
    serializers = {
        'list': YearListSerializer,
        'create': YearCreateSerializer
    }


# Month
class MonthViewSet(PostGetViewMixin,
                   ViewSetMixin,
                   ModelPermissionViewSet):
    queryset = Month.objects.order_by('-year__code', '-code')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = MonthSerializer
    serializers = {
        'list': MonthListSerializer,
        'create': MonthCreateSerializer
    }