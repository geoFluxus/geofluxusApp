# Generated by Django 3.0.6 on 2021-01-18 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0025_vehicle_pm10'),
    ]

    operations = [
        migrations.AlterField(
            model_name='area',
            name='code',
            field=models.TextField(blank=True, null=True),
        ),
    ]
