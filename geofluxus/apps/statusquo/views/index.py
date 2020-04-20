from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render


class StatusQuoView(LoginRequiredMixin, TemplateView):
    template_name = "statusquo/index.html"
    title = "Status Quo"

    def get(self, request):
        return render(request, self.template_name)
