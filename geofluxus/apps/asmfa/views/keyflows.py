from rest_framework.viewsets import ModelViewSet
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


# Process
class ProcessViewSet(ModelViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessSerializer


# Waste
class WasteViewSet(ModelViewSet):
    queryset = Waste.objects.all()
    serializer_class = WasteSerializer


# Material
class MaterialViewSet(ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer


# Product
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# Composite
class CompositeViewSet(ModelViewSet):
    queryset = Composite.objects.all()
    serializer_class = CompositeSerializer