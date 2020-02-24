"""geofluxus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.conf import settings
from geofluxus.views import HomeView
from geofluxus.apps.login.views import LoginView, logout_view


urlpatterns = [
    url(r'^$', HomeView.as_view(), name='index'),
    url(r'^login/', LoginView.as_view(template_name='login/login.html'),
        name='login'),
    url(r'^logout', logout_view, name='logout'),
    path('admin/', admin.site.urls),
    url(r'^api/', include('geofluxus.rest_urls')),
    url(r'^data-entry/', include('geofluxus.apps.dataentry.urls')),
    url(r'^status-quo/', include('geofluxus.apps.statusquo.urls')),
    url(r'routing/', include('geofluxus.apps.routing.urls')),
]\
+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
