from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class AnalyseView(LoginRequiredMixin, TemplateView):
    template_name = "analyse/index.html"
    title = "Analyse"

    def get(self, request):
        return render(request, self.template_name)
