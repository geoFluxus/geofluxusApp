from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from geofluxus.apps.statusquo import views


urlpatterns = [
    url(r'^$', login_required(views.StatusQuoView.as_view()), name='status-quo')
]