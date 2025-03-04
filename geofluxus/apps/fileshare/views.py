from geofluxus.apps.utils.views import (UnlimitedResultsSetPagination)
from geofluxus.apps.utils.views import (PostGetViewMixin,
                                        ViewSetMixin,
                                        ModelPermissionViewSet)
from geofluxus.apps.fileshare.models import SharedFile
from geofluxus.apps.fileshare.serializers import (SharedFileSerializer,
                                                  SharedFileListSerializer)
from geofluxus.apps.asmfa.serializers.bulkupload import (SharedFileCreateSerializer)
from rest_framework.response import Response
import boto3
import os
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from geofluxus.apps.login.templatetags.custom_tags import isExpertUser
import dropbox
import requests


def get_access_token():
    url = "https://api.dropbox.com/oauth2/token"
    data = {
        "refresh_token": os.environ['DROPBOX_KEY'],
        "grant_type": "refresh_token",
        "client_id": os.environ['DROPBOX_CLIENT'],
        "client_secret": os.environ['DROPBOX_SECRET'],
    }
    response = requests.post(url, data=data)
    return response.json().get("access_token")


def dropbox_auth():
    access_token = get_access_token()
    dbx = dropbox.Dropbox(access_token)

    # Get the team root namespace ID
    team_root = dbx.users_get_current_account().root_info.root_namespace_id

    # Reinitialize client with team space context
    dbx = dbx.with_path_root(dropbox.common.PathRoot.namespace_id(team_root))

    return dbx


def download_file(fid=None):
    dbx = dropbox_auth()
    try:
        file_metadata = dbx.files_get_metadata(fid)
        file_path = file_metadata.path_display
        result = dbx.files_get_temporary_link(file_path)
        download_link = result.link
        return download_link
    except dropbox.exceptions.ApiError as e:
        return None


class FileShareView(LoginRequiredMixin, TemplateView):
    template_name = "fileshare/index.html"
    title = "Datasets"

    def get(self, request):
        if isExpertUser(request.user):
            return render(request, self.template_name)
        else:
            return render(request, "access_denied.html")


# SharedFile
class SharedFileViewSet(PostGetViewMixin,
                        ViewSetMixin,
                        ModelPermissionViewSet):
    queryset = SharedFile.objects.order_by('name')
    pagination_class = UnlimitedResultsSetPagination
    serializer_class = SharedFileSerializer
    serializers = {
        'list': SharedFileListSerializer,
        'create': SharedFileCreateSerializer
    }

    def download_file(self, filename):
        return download_file(filename)

    def list(self, request, **kwargs):
        # download dataset file
        if request.query_params.get('request', None) == 'download':
            url = request.query_params.get('id', None)
            return Response(self.download_file(url))

        # retrieve datasets for user
        user = request.user
        ids = user.get_datasets()

        # filter and serialize
        if not user.is_superuser:
            self.queryset = self.queryset.filter(dataset__id__in=ids)

        return super().list(request, **kwargs)
