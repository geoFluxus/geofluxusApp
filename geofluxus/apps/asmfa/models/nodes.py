from django.db import models


# Activity group
class ActivityGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Activity
class Activity(models.Model):
    name = models.CharField(max_length=255)
    nace = models.CharField(max_length=255)
    activitygroup = models.ForeignKey(ActivityGroup,
                                      on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'activities'

    def __str__(self):
        return '{} - {}'.format(self.nace, self.name)


# Process group
class ProcessGroup(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Process
class Process(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    processgroup = models.ForeignKey(ProcessGroup,
                                     on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = 'processes'

    def __str__(self):
        return '{} - {}'.format(self.code, self.name)


# Company
class Company(models.Model):
    name = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name
