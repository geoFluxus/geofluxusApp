from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class DataEntryView(LoginRequiredMixin, TemplateView):
    template_name = "dataentry/index.html"
    title = "Data Entry"

    def get(self, request):
        return render(request, self.template_name)