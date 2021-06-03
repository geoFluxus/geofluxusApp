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
        #workdocs
        try:
            client = boto3.client(
                'workdocs',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
                region_name='eu-west-1'
            )
            response = client.get_document(
                DocumentId=filename,
                IncludeCustomMetadata=True
            )
            version = response['Metadata']['LatestVersionMetadata']

            response = client.get_document_version(
                DocumentId=filename,
                VersionId=version['Id'],
                Fields='SOURCE'
            )
            url = response['Metadata']['Source']['ORIGINAL']
            
            return url
        except:
            return

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
