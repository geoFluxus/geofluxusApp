from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (ProcessGroup,
                                         Process,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         Material,
                                         Product,
                                         Composite,
                                         Year,
                                         Month)
from geofluxus.apps.asmfa.serializers import (ProcessGroupSerializer,
                                              ProcessSerializer,
                                              Waste02Serializer,
                                              Waste04Serializer,
                                              Waste06Serializer,
                                              MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer,
                                              YearSerializer,
                                              MonthSerializer)
from geofluxus.apps.asmfa.serializers import (ProcessGroupListSerializer,
                                              ProcessListSerializer,
                                              Waste02ListSerializer,
                                              Waste04ListSerializer,
                                              Waste06ListSerializer,
                                              MaterialListSerializer,
                                              ProductListSerializer,
                                              CompositeListSerializer,
                                              YearListSerializer,
                                              MonthListSerializer)
from geofluxus.apps.asmfa.serializers import (ProcessGroupCreateSerializer,
                                              ProcessCreateSerializer,
                                              Waste02CreateSerializer,
                                              Waste04CreateSerializer,
                                              Waste06CreateSerializer,
                                              MaterialCreateSerializer,
                                              ProductCreateSerializer,
                                              CompositeCreateSerializer,
                                              YearCreateSerializer,
                                              MonthCreateSerializer)
from django.db.models import Count


# Process group
class ProcessGroupViewSet(PostGetViewMixin,
                          ViewSetMixin,
                          ModelPermissionViewSet):
    queryset = ProcessGroup.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class =  ProcessGroupSerializer
    serializers = {
        'list': ProcessGroupListSerializer,
        'create': ProcessGroupCreateSerializer
    }

    def get_queryset(self):
        queryset = ProcessGroup.objects
        queryset = queryset.annotate(
            flow_count=Count('process__flowchain__flow')
        )
        return queryset.order_by('id')


# Process
class ProcessViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Process.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ProcessSerializer
    serializers = {
        'list': ProcessListSerializer,
        'create': ProcessCreateSerializer
    }

    def get_queryset(self):
        queryset = Process.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')


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

    def get_queryset(self):
        queryset = Waste02.objects
        queryset = queryset.annotate(
            flow_count=Count('waste04__waste06__flowchain__flow')
        )
        return queryset.order_by('id')

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

    def get_queryset(self):
        queryset = Waste04.objects
        queryset = queryset.annotate(
            flow_count=Count('waste06__flowchain__flow')
        )
        return queryset.order_by('id')

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

    def get_queryset(self):
        queryset = Waste06.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')


# Material
class MaterialViewSet(PostGetViewMixin,
                      ViewSetMixin,
                      ModelPermissionViewSet):
    queryset = Material.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = MaterialSerializer
    serializers = {
        'list': MaterialListSerializer,
        'create': MaterialCreateSerializer
    }

    def get_queryset(self):
        queryset = Material.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')


# Product
class ProductViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Product.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ProductSerializer
    serializers = {
        'list': ProductListSerializer,
        'create': ProductCreateSerializer
    }

    def get_queryset(self):
        queryset = Product.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')


# Composite
class CompositeViewSet(PostGetViewMixin,
                       ViewSetMixin,
                       ModelPermissionViewSet):
    queryset = Composite.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = CompositeSerializer
    serializers = {
        'list': CompositeListSerializer,
        'create': CompositeCreateSerializer
    }

    def get_queryset(self):
        queryset = Composite.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')

# Year
class YearViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Year.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = YearSerializer
    serializers = {
        'list': YearListSerializer,
        'create': YearCreateSerializer
    }

    def get_queryset(self):
        queryset = Year.objects
        queryset = queryset.annotate(
            flow_count=Count('month__flowchain__flow')
        )
        return queryset.order_by('id')


# Month
class MonthViewSet(PostGetViewMixin,
                   ViewSetMixin,
                   ModelPermissionViewSet):
    queryset = Month.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = MonthSerializer
    serializers = {
        'list': MonthListSerializer,
        'create': MonthCreateSerializer
    }

    def get_queryset(self):
        queryset = Month.objects
        queryset = queryset.annotate(
            flow_count=Count('flowchain__flow')
        )
        return queryset.order_by('id')