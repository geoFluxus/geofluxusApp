from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from geofluxus.apps.analyse import views


urlpatterns = [
    url(r'^$', login_required(views.AnalyseView.as_view()), name='analyse')
]