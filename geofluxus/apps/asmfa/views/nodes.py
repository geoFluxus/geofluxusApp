from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
                                         Company)
from geofluxus.apps.asmfa.serializers import (ActivityGroupSerializer,
                                              ActivitySerializer,
                                              ProcessGroupSerializer,
                                              ProcessSerializer,
                                              CompanySerializer)
from geofluxus.apps.asmfa.serializers import (ActivityGroupListSerializer,
                                              ActivityListSerializer,
                                              ProcessGroupListSerializer,
                                              ProcessListSerializer,
                                              CompanyListSerializer)
from geofluxus.apps.asmfa.serializers import (ActivityGroupCreateSerializer,
                                              ActivityCreateSerializer,
                                              ProcessGroupCreateSerializer,
                                              ProcessCreateSerializer,
                                              CompanyCreateSerializer)
from django.db.models import Count, Value, IntegerField
from django.db.models import Q


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


# Process group
class ProcessGroupViewSet(PostGetViewMixin,
                          ViewSetMixin,
                          ModelPermissionViewSet):
    queryset = ProcessGroup.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = ProcessGroupSerializer
    serializers = {
        'list': ProcessGroupListSerializer,
        'create': ProcessGroupCreateSerializer
    }

    def get_queryset(self):
        queryset = ProcessGroup.objects
        queryset = queryset.annotate(
            flow_count=Value(0, output_field=IntegerField())
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

    def get_queryset(self, *args, **kwargs):
        queryset = super(CompanyViewSet, self).get_queryset(*args, **kwargs)
        query = self.request.GET.get('q')

        if query:
            queryset = queryset.filter(Q(name__icontains=query))

        return queryset




# from django.db.models import Q
# from django.views.generic.list import ListView
# from django.views.decorators.http import require_http_methods
# from django.http import JsonResponse
#
# class CompanyListView(ListView):
#     model = Company
#     template_name = 'some_template.html'
#
#     def get_context_data(self, *args, **kwargs):
#         context = super(CompanyListView, self).get_context_data(*args, **kwargs)
#         context['query'] = self.request.GET.get('q')
#         return context