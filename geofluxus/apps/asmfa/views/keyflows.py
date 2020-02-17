from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite)
from geofluxus.apps.asmfa.serializers import (ProcessSerializer,
                                              WasteSerializer,
                                              MaterialSerializer,
                                              ProductSerializer,
                                              CompositeSerializer)
from geofluxus.apps.asmfa.serializers import (ProcessListSerializer,
                                              WasteListSerializer,
                                              MaterialListSerializer,
                                              ProductListSerializer,
                                              CompositeListSerializer)
from geofluxus.apps.asmfa.serializers import (ProcessCreateSerializer,
                                              WasteCreateSerializer,
                                              MaterialCreateSerializer,
                                              ProductCreateSerializer,
                                              CompositeCreateSerializer)
from django.db.models import Count


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


# Waste
class WasteViewSet(PostGetViewMixin,
                   ViewSetMixin,
                   ModelPermissionViewSet):
    queryset = Waste.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = WasteSerializer
    serializers = {
        'list': WasteListSerializer,
        'create': WasteCreateSerializer
    }

    def get_queryset(self):
        queryset = Waste.objects
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