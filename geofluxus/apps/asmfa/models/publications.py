from django.db import models


# PublicationType
class PublicationType(models.Model):
    name = models.CharField(max_length=255)


# Publication
class Publication(models.Model):
    citekey = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    note = models.TextField()
    type = models.ForeignKey(PublicationType,
                             on_delete=models.CASCADE)
    url = models.URLField(max_length=200)
    file_url = models.URLField(max_length=200)