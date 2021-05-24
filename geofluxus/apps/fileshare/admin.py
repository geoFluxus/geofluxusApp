from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from geofluxus.apps.fileshare.models import (SharedFile)


# User Filter
@admin.register(SharedFile)
class SharedFileAdmin(CustomAdmin):
    search_fields = ['name']
