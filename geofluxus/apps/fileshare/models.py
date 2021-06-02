from django.db import models
from geofluxus.apps.asmfa.models import Dataset


# shared file
class SharedFile(models.Model):
    name = models.CharField(max_length=255)
    role_choices = [('dataset', 'dataset'),
                    ('documentation', 'documentation')]
    type = models.CharField(max_length=255,
                            choices=role_choices,
                            default='dataset')
    url = models.CharField(max_length=255)
    dataset = models.ForeignKey(Dataset,
                                on_delete=models.CASCADE)

    def __str__(self):
        return self.name