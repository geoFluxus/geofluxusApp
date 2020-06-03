from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from geofluxus.apps.login.models import UserFilter


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(CustomAdmin):
    search_fields = ['user__username']