from django.contrib import admin
from django.contrib.admin import ModelAdmin
from geofluxus.apps.login.models import UserFilter


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(ModelAdmin):
    pass