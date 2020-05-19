from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Waste02,
                                         Waste04,
                                         Waste06,
                                         Material,
                                         Product,
                                         Composite,
                                         Year,
                                         Month)
from geofluxus.apps.asmfa.serializers import (Waste02Serializer,
                                              Waste04Serializer,
                                              Waste06Serializer,
                                              MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer,
                                              YearSerializer,
                                              MonthSerializer)
from geofluxus.apps.asmfa.serializers import (Waste02ListSerializer,
                                              Waste04ListSerializer,
                                              Waste06ListSerializer,
                                              MaterialListSerializer,
                                              ProductListSerializer,
                                              CompositeListSerializer,
                                              YearListSerializer,
                                              MonthListSerializer)
from geofluxus.apps.asmfa.serializers import (Waste02CreateSerializer,
                                              Waste04CreateSerializer,
                                              Waste06CreateSerializer,
                                              MaterialCreateSerializer,
                                              ProductCreateSerializer,
                                              CompositeCreateSerializer,
                                              YearCreateSerializer,
                                              MonthCreateSerializer)
from django.db.models import Count


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
    queryset = Material.objects.order_by('name')
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
        return queryset.order_by('name')


# Product
class ProductViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Product.objects.order_by('name')
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
        return queryset.order_by('name')


# Composite
class CompositeViewSet(PostGetViewMixin,
                       ViewSetMixin,
                       ModelPermissionViewSet):
    queryset = Composite.objects.order_by('name')
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
        return queryset.order_by('name')

# Year
class YearViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Year.objects.order_by('code')
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
        return queryset.order_by('code')


# Month
class MonthViewSet(PostGetViewMixin,
                   ViewSetMixin,
                   ModelPermissionViewSet):
    queryset = Month.objects.order_by('year__code', 'code')
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
        return queryset.order_by('year__code', 'code')