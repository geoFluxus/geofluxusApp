from django.db import models


# Process
class Process(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)


# Waste
class Waste(models.Model):
    ewc_name = models.CharField(max_length=255)
    ewc_code = models.CharField(max_length=255)
    hazardous = models.BooleanField()


# Material
class Material(models.Model):
    name = models.CharField(max_length=255)


# Product
class Product(models.Model):
    name = models.CharField(max_length=255)


# Composite
class Composite(models.Model):
    name = models.CharField(max_length=255)