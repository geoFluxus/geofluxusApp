from django.urls import re_path
from django.contrib.auth.decorators import login_required
from geofluxus.apps.analyse import views


urlpatterns = [
    re_path(r'^$', login_required(views.AnalyseView.as_view()), name='analyse')
]