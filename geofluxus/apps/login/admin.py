from django.contrib import admin
from geofluxus.apps.asmfa.admin import CustomAdmin
from django.contrib.admin import TabularInline
from geofluxus.apps.login.models import (UserFilter,
                                         UserPublication,
                                         PublicationInUser)


# User Filter
@admin.register(UserFilter)
class UserFilterAdmin(CustomAdmin):
    search_fields = ['user__username']


# Publication
class PublicationInUserInline(TabularInline):
    model = PublicationInUser


# User Publication
@admin.register(UserPublication)
class UserPublicationAdmin(CustomAdmin):
    inlines = (PublicationInUserInline,)