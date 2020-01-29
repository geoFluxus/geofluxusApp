from django.db import models
from geofluxus.apps.asmfa.models import (Process,
                                         Waste,
                                         Material,
                                         Product,
                                         Composite,
                                         Actor,
                                         Publication)


# FlowChain
class FlowChain(models.Model):
    identifier = models.CharField(max_length=255)
    route = models.BooleanField()
    collector = models.BooleanField()
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=3)
    trips = models.IntegerField()
    year = models.IntegerField()
    process = models.ForeignKey(Process,
                                on_delete=models.CASCADE)
    waste = models.ForeignKey(Waste,
                              on_delete=models.CASCADE)
    materials = models.ManyToManyField(Material,
                                       through='MaterialInChain')
    products = models.ManyToManyField(Product,
                                      through='ProductInChain')
    composites = models.ManyToManyField(Composite,
                                        through='CompositeInChain')
    publication = models.ForeignKey(Publication,
                                    null=True, blank=True,
                                    on_delete=models.CASCADE)

    def __str__(self):
        return self.identifier


# Flow
class Flow(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    origin = models.ForeignKey(Actor,
                               on_delete=models.CASCADE,
                               related_name='outputs')
    destination = models.ForeignKey(Actor,
                                    on_delete=models.CASCADE,
                                    related_name='inputs')
    origin_role = models.CharField(max_length=255)
    destination_role = models.CharField(max_length=255)

    def __str__(self):
        return "{}->{}".format(self.origin,
                               self.destination)


# MaterialInChain
class MaterialInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    material = models.ForeignKey(Material,
                                 on_delete=models.CASCADE)


# ProductInChain
class ProductInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    product = models.ForeignKey(Product,
                                on_delete=models.CASCADE)


# CompositeInChain
class CompositeInChain(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    composite = models.ForeignKey(Composite,
                                  on_delete=models.CASCADE)


# Classification
class Classification(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    clean = models.BooleanField(null=True)
    mixed = models.BooleanField(null=True)
    direct_use = models.BooleanField(null=True)

    def __str__(self):
        return self.flowchain


# ExtraDescription
class ExtraDescription(models.Model):
    flowchain = models.ForeignKey(FlowChain,
                                  on_delete=models.CASCADE)
    description_type_choices = (("RE", "Reason"),
                                ("OR", "Origin"),
                                ("COL", "Colour"),
                                ("ST", "State"),
                                ("DIM", "Dimensions"),
                                ("SH", "Shape"),
                                ("CON", "Consistency"),
                                ("COD", "Codes"),
                                ("MAT", "Material type"),
                                ("PRO", "Product type"),
                                ("COMP", "Composite type")
                               )
    type = models.CharField(max_length=255, choices=description_type_choices)
    description = models.TextField(null=True)

    def __str__(self):
        return self.flowchain