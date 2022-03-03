from django.urls import re_path
from django.contrib.auth.decorators import login_required
from geofluxus.apps.fileshare import views


urlpatterns = [
    re_path(r'^$', login_required(views.FileShareView.as_view()), name='datasets')
]