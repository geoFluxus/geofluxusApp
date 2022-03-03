from django.urls import re_path
from django.contrib.auth.decorators import login_required
from geofluxus.apps.dataentry import views


urlpatterns = [
    re_path(r'^$', login_required(views.DataEntryView.as_view()), name='data-entry')
]