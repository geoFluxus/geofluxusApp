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
from django.urls import re_path, include
from django.conf.urls.static import static
from django.conf import settings
from geofluxus.views import HomeView
from geofluxus.apps.login.views import LoginView, logout_view

urlpatterns = [
    re_path(r'^$', HomeView.as_view(), name='index'),
    re_path(r'^login/', LoginView.as_view(template_name='login/login.html'),
        name='login'),
    re_path(r'^logout', logout_view, name='logout'),
    re_path('admin/', admin.site.urls),
    re_path(r'^api/', include('geofluxus.rest_urls')),
    re_path(r'^data-entry/', include('geofluxus.apps.dataentry.urls')),
    re_path(r'^analyse/', include('geofluxus.apps.analyse.urls')),
    re_path(r'^datasets/', include('geofluxus.apps.fileshare.urls'))
]\
+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
