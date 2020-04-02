from django.contrib.auth import views as auth_views, logout
from django.shortcuts import redirect


class LoginView(auth_views.LoginView):
    def form_valid(self, form):
        response = super().form_valid(form)
        return response

def logout_view(request):
    logout(request)
    return redirect('/')
