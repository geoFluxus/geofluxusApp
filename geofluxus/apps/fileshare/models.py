from django.db import models
from geofluxus.apps.asmfa.models import Dataset


# shared file
class SharedFile(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=200,
                          blank=True,
                          null=True)
    dataset = models.ForeignKey(Dataset,
                                on_delete=models.CASCADE)