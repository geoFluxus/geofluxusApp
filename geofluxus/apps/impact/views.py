from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class ImpactView(LoginRequiredMixin, TemplateView):
    template_name = "impact/index.html"
    title = "impact"

    def get(self, request):
        return render(request, self.template_name)
