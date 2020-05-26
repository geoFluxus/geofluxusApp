from django.db import models
from django.contrib.auth.models import User


# Save / edit user filters
class UserFilter(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE)
    filter = models.TextField()