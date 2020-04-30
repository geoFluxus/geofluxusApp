from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from geofluxus.apps.impact import views


urlpatterns = [
    url(r'^$', login_required(views.ImpactView.as_view()), name='impact')
]