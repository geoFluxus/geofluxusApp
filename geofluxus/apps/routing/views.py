from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class RoutingView(LoginRequiredMixin, TemplateView):
    template_name = "routing/index.html"
    title = "Routing"

    def get(self, request):
        return render(request, self.template_name)
