from django.db import models


# Waste02 (2-digit EWC code)
class Waste02(models.Model):
    ewc_name = models.CharField(max_length=255)
    ewc_code = models.CharField(max_length=255)

    def __str__(self):
        return "{} - {}".format(self.ewc_code,
                                self.ewc_name)


# Waste04 (4-digit EWC code)
class Waste04(models.Model):
    ewc_name = models.CharField(max_length=255)
    ewc_code = models.CharField(max_length=255)
    waste02 = models.ForeignKey(Waste02,
                                on_delete=models.CASCADE)

    def __str__(self):
        return "{} - {}".format(self.ewc_code,
                                self.ewc_name)


# Waste06 (6-digit EWC code)
class Waste06(models.Model):
    ewc_name = models.CharField(max_length=255)
    ewc_code = models.CharField(max_length=255)
    waste04 = models.ForeignKey(Waste04,
                                on_delete=models.CASCADE)
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


# Year
class Year(models.Model):
    code = models.CharField(max_length=255)

    def __str__(self):
        return self.code

    def save(self, **kwargs):
        super().save(**kwargs)

        months = Month.objects.filter(year=self)
        months.delete()

        options = ["{:02d}".format(i) for i in range(1, 13)]
        months = []
        for option in options:
            month = Month(
                code=''.join([option, self.code]),
                year=self
            )
            months.append(month)
        if months:
            Month.objects.bulk_create(months)


# Month
class Month(models.Model):
    code = models.CharField(max_length=255)
    year = models.ForeignKey(Year,
                             on_delete=models.CASCADE)

    def __str__(self):
        return '{}-{}'.format(self.code[:2], self.code[2:])