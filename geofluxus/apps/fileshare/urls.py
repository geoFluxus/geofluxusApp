from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from geofluxus.apps.fileshare import views


urlpatterns = [
    url(r'^$', login_required(views.FileShareView.as_view()), name='datasets')
]