from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (AdminLevel,
                                         Area,
                                         Actor)
from geofluxus.apps.asmfa.serializers import (AdminLevelSerializer,
                                              AreaSerializer,
                                              ActorSerializer)
from geofluxus.apps.asmfa.serializers import (AdminLevelListSerializer,
                                              AreaListSerializer,
                                              ActorListSerializer)
from geofluxus.apps.asmfa.serializers import (AdminLevelCreateSerializer,
                                              AreaCreateSerializer,
                                              ActorCreateSerializer)
from rest_framework.response import Response
from django.db.models import Q


# AdminLevel
class AdminLevelViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    queryset = AdminLevel.objects.order_by('level')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AdminLevelSerializer
    serializers = {
        'list': AdminLevelListSerializer,
        'create': AdminLevelCreateSerializer
    }

    def list(self, request, **kwargs):
        # check area levels for user datasets
        user = request.user
        if not user.is_superuser:
            ids = [str(id) for id in user.get_datasets()]
            user_levels = Area.objects.filter(dataset__in=ids)\
                .values_list('adminlevel', flat=True).distinct()
            actor_level = AdminLevel.objects.filter(level=1000)\
                .values_list('id', flat=True)[0]

            # return only user-specific levels
            self.queryset = AdminLevel.objects.filter(
                Q(id__in=user_levels) |\
                Q(id=actor_level)
            ).order_by('level')
        return super().list(request, **kwargs)


# Area
class AreaViewSet(PostGetViewMixin,
                  ViewSetMixin,
                  ModelPermissionViewSet):
    queryset = Area.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AreaSerializer
    serializers = {
        'list': AreaListSerializer,
        'create': AreaCreateSerializer
    }


# AreaInLevel
class AreaInLevelViewSet(PostGetViewMixin,
                         ViewSetMixin,
                         ModelPermissionViewSet):
    queryset = Area.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = AreaSerializer

    def list(self, request, level_pk=None):
        queryset = Area.objects.simplified(level=level_pk, request=request)
        serializer = AreaListSerializer(queryset,
                                        many=True,
                                        context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None, level_pk=None):
        queryset = Area.objects.filter(pk=pk,
                                       adminlevel=level_pk)
        serializer = AreaListSerializer(queryset,
                                        many=True,
                                        context={'request': request})
        return Response(serializer.data)


# Actor
class ActorViewSet(PostGetViewMixin,
                   ViewSetMixin,
                   ModelPermissionViewSet):
    queryset = Actor.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ActorSerializer
    serializers = {
        'list': ActorListSerializer,
        'create': ActorCreateSerializer
    }