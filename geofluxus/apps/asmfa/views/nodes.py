from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         Company,
                                         Actor,
                                         Flow)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer,
                                              ActivitySerializer,
                                              CompanySerializer,
                                              ActorSerializer)
from geofluxus.apps.asmfa.serializers import (ActivityGroupListSerializer,
                                              ActivityListSerializer,
                                              CompanyListSerializer,
                                              ActorListSerializer)
from geofluxus.apps.asmfa.serializers import (ActivityGroupCreateSerializer,
                                              ActivityCreateSerializer,
                                              CompanyCreateSerializer,
                                              ActorCreateSerializer)
from django.db.models import Count


# Activity group
class ActivityGroupViewSet(PostGetViewMixin,
                           ViewSetMixin,
                           ModelPermissionViewSet):
    queryset = ActivityGroup.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ActivityGroupSerializer
    serializers = {
        'list': ActivityGroupListSerializer,
        'create': ActivityGroupCreateSerializer
    }

    def get_queryset(self):
        queryset = ActivityGroup.objects
        queryset = queryset.annotate(
            flow_count=Count('activity__actor__outputs', distinct=True) +
                       Count('activity__actor__inputs', distinct=True))
        return queryset.order_by('id')


# Activity
class ActivityViewSet(PostGetViewMixin,
                      ViewSetMixin,
                      ModelPermissionViewSet):
    queryset = Activity.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ActivitySerializer
    serializers = {
        'list': ActivityListSerializer,
        'create': ActivityCreateSerializer
    }

    def get_queryset(self):
        queryset = Activity.objects.order_by('id')
        queryset = queryset.annotate(
            flow_count=Count('actor__outputs', distinct=True) +
                       Count('actor__inputs', distinct=True))
        return queryset


# Company
class CompanyViewSet(PostGetViewMixin,
                     ViewSetMixin,
                     ModelPermissionViewSet):
    queryset = Company.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = CompanySerializer
    serializers = {
        'list': CompanyListSerializer,
        'create': CompanyCreateSerializer
    }

    def get_queryset(self):
        queryset = Company.objects.order_by('id')
        return queryset


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

    def get_queryset(self):
        queryset = Actor.objects
        queryset = queryset.annotate(
            flow_count=Count('outputs', distinct=True) +
                       Count('inputs', distinct=True))
        return queryset.order_by('id')