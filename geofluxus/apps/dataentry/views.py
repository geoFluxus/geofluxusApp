from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class DataEntryView(LoginRequiredMixin, TemplateView):
    template_name = "dataentry/index.html"
    title = "Data Entry"

    def get(self, request):
        if request.user.is_superuser:
            return render(request, self.template_name)
        else:
            return render(request, "access_denied.html")