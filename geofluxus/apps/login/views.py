from django.contrib.auth import views as auth_views, logout
from django.shortcuts import redirect
from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.login.models import (UserFilter)
from geofluxus.apps.login.serializers import (UserFilterSerializer)
from geofluxus.apps.login.serializers import (UserFilterListSerializer)


# Login/Logout
class LoginView(auth_views.LoginView):
    def form_valid(self, form):
        response = super().form_valid(form)
        return response


def logout_view(request):
    logout(request)
    return redirect('/')


# User Filter
class UserFilterViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    queryset = UserFilter.objects.order_by('id')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = UserFilterSerializer
    serializers = {
        'list': UserFilterListSerializer
    }

    def get_queryset(self):
        # check current user and retrieve filters
        id = self.request.user.id
        queryset = UserFilter.objects.filter(user__id=id)\
                                     .order_by('id')
        return queryset
