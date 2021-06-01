from django.contrib.auth import views as auth_views, logout
from django.shortcuts import redirect
from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.login.models import (User, UserFilter)
from geofluxus.apps.login.serializers import (UserFilterSerializer)
from geofluxus.apps.login.serializers import (UserFilterListSerializer)
import json
from django.utils import timezone
from rest_framework.response import Response
from django.contrib.sessions.models import Session


# Login/Logout
class LoginView(auth_views.LoginView):
    def form_valid(self, form):
        response = super().form_valid(form)
        # clear all user sessions
        user = User.objects.filter(username=form.data['username']).first()
        for session in Session.objects.all():
            if str(user.pk) == session.get_decoded().get('_auth_user_id'):
                session.delete()
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
        user_id = self.request.user.id
        queryset = UserFilter.objects.filter(user__id=user_id)\
                                     .order_by('-date')
        return queryset

    def post_get(self, request, **kwargs):
        # retrieve filters
        params = {}
        for key, value in request.data.items():
            try:
                params[key] = json.loads(value)
            except json.decoder.JSONDecodeError:
                params[key] = value

        # retrieve filter action & user
        action = params.pop('action', None)
        user_id = self.request.user.id
        user = User.objects.filter(id=user_id)[0]

        # create new user filter
        if action == 'create':
            # retrieve filter name
            name = params.pop('name', None)

            # collect all filter names for user (should be unique)
            names = UserFilter.objects.filter(user__id=user_id)\
                                      .values_list('name', flat=True)

            # if name does not exist, create
            if name in names:
                return Response('A filter with this name already exists. '
                                'Please fill in another name.', status=500)
            else:
                filter = params.pop('filter', None)
                new = UserFilter(user=user,
                                 name=name,
                                 filter=json.dumps(filter),
                                 date=timezone.now())
                new.save()
        elif action == 'update':
            # retrieve filter id
            id = params.pop('id', None)

            # retrieve filter
            filter = UserFilter.objects.filter(user__id=user.id) \
                                       .filter(id=id)

            # update name
            name = params.pop('name', None)
            if name:
                # check all other filter names
                names = UserFilter.objects.filter(user__id=user_id) \
                                          .exclude(id=id) \
                                          .values_list('name', flat=True)
                if name in names:
                    return Response('A filter with this name already exists. '
                                    'Please fill in another name.', status=500)
                else:
                    filter.update(name=name)

            # update filter params
            filterParams = params.pop('filter', None)
            if filterParams: filter.update(filter=json.dumps(filterParams))

            # update date
            filter.update(date=timezone.now())
        elif action == 'delete':
            # retrieve filter id
            id = params.pop('id', None)

            # find user filter by name (should be unique)
            filter = UserFilter.objects.filter(user__id=user.id)\
                                       .filter(id=id)
            filter.delete()

        # fetch all user filters
        filters = UserFilter.objects.filter(user__id=user_id)\
                                    .order_by('-date')
        data = UserFilterSerializer(filters,
                                    many=True,
                                    context={'request': request}).data
        return Response(data)



