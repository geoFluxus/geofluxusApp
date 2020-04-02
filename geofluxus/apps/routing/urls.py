from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from geofluxus.apps.routing import views


urlpatterns = [
    url(r'^$', login_required(views.RoutingView.as_view()), name='routing')
]