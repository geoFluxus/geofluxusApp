from django.db import models


# DatasetType
class DatasetType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Dataset
class Dataset(models.Model):
    citekey = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    note = models.TextField()
    datasettype = models.ForeignKey(DatasetType,
                                    null=True, blank=True,
                                    on_delete=models.SET_NULL)
    url = models.URLField(max_length=200,
                          blank=True,
                          null=True)
    file_url = models.URLField(max_length=200,
                               blank=True,
                               null=True)

    def __str__(self):
        return self.title