from django.contrib import admin
from django.contrib.admin import TabularInline
from django.contrib.gis.admin import GeoModelAdmin
from geofluxus.apps.asmfa.models import (ActivityGroup,
                                         Activity,
                                         ProcessGroup,
                                         Process,
                                         Company,
                                         Actor,
                                         Waste02,
                                         Waste04,
                                         Waste06,
                                         GNcode,
                                         TreatmentEmission,
                                         Year,
                                         Month,
                                         FlowChain,
                                         Flow,
                                         AdminLevel,
                                         Area,
                                         Dataset,
                                         DatasetType,
                                         Routing,
                                         Vehicle)
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.utils.crypto import get_random_string
from django.contrib.auth.forms import PasswordResetForm
from django.contrib import messages
from django import forms


# Custom Admin
# supports non-geo and geo models
class CustomAdmin(GeoModelAdmin):
    # minimum pagination for faster loading
    list_per_page = 10

    def __init__(self, model, admin_site):
        super().__init__(model, admin_site)
        self.get_raw_id_fields()

    # avoid loading all instances of foreign key models
    # as dropdown lists in admin site
    def get_raw_id_fields(self):
        foreign_keys = []
        fields = self.model._meta.fields
        for field in fields:
            if field.get_internal_type() == 'ForeignKey':
                foreign_keys.append(field.name)
        self.raw_id_fields = tuple(foreign_keys)

    def get_ordering(self, request):
        return self.search_fields


# Activity Group
@admin.register(ActivityGroup)
class ActivityGroupAdmin(CustomAdmin):
    search_fields = ['code']


# Activity
@admin.register(Activity)
class ActivityAdmin(CustomAdmin):
    search_fields = ['nace']


# ProcessGroup
@admin.register(ProcessGroup)
class ProcessGroupAdmin(CustomAdmin):
    search_fields = ['name']


# Process
@admin.register(Process)
class ProcessAdmin(CustomAdmin):
    search_fields = ['code']


# Company
@admin.register(Company)
class CompanyAdmin(CustomAdmin):
    search_fields = ['name']


# Actor
@admin.register(Actor)
class ActorAdmin(CustomAdmin):
    search_fields = ['identifier']


# Waste02
@admin.register(Waste02)
class Waste02Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# Waste04
@admin.register(Waste04)
class Waste04Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# Waste06
@admin.register(Waste06)
class Waste06Admin(CustomAdmin):
    search_fields = ['ewc_code', 'ewc_name']


# GNcode
@admin.register(GNcode)
class GNcodeAdmin(CustomAdmin):
    search_fields = ['code', 'name']


# Treatment emissions
@admin.register(TreatmentEmission)
class TreatmentEmissionAdmin(CustomAdmin):
    search_fields = ['processgroup__name', 'waste06__ewc_code']


# Year
@admin.register(Year)
class YearAdmin(CustomAdmin):
    search_fields = ['code']


# Month
@admin.register(Month)
class MonthAdmin(CustomAdmin):
    search_fields = ['year__code', 'code']


@admin.register(FlowChain)
class FlowChainAdmin(CustomAdmin):
    search_fields = ['identifier']


# Flow
@admin.register(Flow)
class FlowAdmin(CustomAdmin):
    search_fields = ['flowchain__identifier']


# AdminLevel
@admin.register(AdminLevel)
class AdminLevelAdmin(CustomAdmin):
    search_fields = ['name']


# Area
@admin.register(Area)
class AreaAdmin(CustomAdmin):
    search_fields = ['name']


# Dataset
admin.site.register(Dataset)
class DatasetAdmin(CustomAdmin):
    search_fields = ['title']
admin.site.register(DatasetType, CustomAdmin)


# Routing
@admin.register(Routing)
class RoutingAdmin(CustomAdmin):
    search_fields = ['origin__identifier',
                     'destination__identifier']


# Vehicle
@admin.register(Vehicle)
class VehicleAdmin(CustomAdmin):
    search_fields = ['name']


# CUSTOM USER ADMIN
# do not require password in user create form
class CustomUserCreateForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].required = False
        self.fields['password2'].required = False
        self.fields['email'].required = True
        self.fields['groups'].required = True
        self.fields['password1'].widget.attrs['autocomplete'] = 'off'
        self.fields['password2'].widget.attrs['autocomplete'] = 'off'

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = super().clean_password2()
        if bool(password1) ^ bool(password2):
            raise forms.ValidationError("Fill out both fields")
        return password2


# require email in user change form
class CustomUserChangeForm(UserChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].required = True


class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreateForm
    add_fieldsets = (
        (None, {
            'description': (
                "Enter the new user's name and email address and click save."
                " The user will be emailed a link allowing them to login to"
                " the site and set their password."
            ),
            'fields': ('email', 'username'),
        }),
        (None, {
            "fields": ("groups",),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change and (not form.cleaned_data['password1'] or not obj.has_usable_password()):
            # Django's PasswordResetForm won't let us reset an unusable
            # password. We set it above super() so we don't have to save twice.
            obj.set_password(get_random_string(length=20))
            reset_password = True
        else:
            reset_password = False

        obj.username = obj.username.lower()
        obj.email = obj.email.lower()
        super().save_model(request, obj, form, change)

        if reset_password:
            reset_form = PasswordResetForm({'email': obj.email})
            assert reset_form.is_valid()
            reset_form.save(
                request=request,
                use_https=request.is_secure(),
                subject_template_name='commons/first_login.txt',
                email_template_name='commons/first_login_email.html',
            )
            messages.add_message(request, messages.INFO,
                                 f'A first-login email has been sent to {obj.email}')

    class Meta:
        model = User


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)