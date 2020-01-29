from django.db import models


# Process
class Process(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Waste
class Waste(models.Model):
    ewc_name = models.CharField(max_length=255)
    ewc_code = models.CharField(max_length=255)
    hazardous = models.BooleanField()

    def __str__(self):
        return "{} - {}".format(self.ewc_code,
                                self.ewc_name)


# Material
class Material(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Product
class Product(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Composite
class Composite(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name