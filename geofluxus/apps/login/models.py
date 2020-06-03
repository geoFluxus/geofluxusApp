from django.db import models
from django.contrib.auth.models import User


# Save / edit user filters
class UserFilter(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.CASCADE)
    name = models.CharField(max_length=255,
                            blank=True,
                            null=True)
    filter = models.TextField()
    date = models.DateTimeField(blank=True,
                                null=True)

    def __str__(self):
        return f'{self.user}: {self.name} ({self.date})'