# Generated by Django 3.0.6 on 2020-08-12 11:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0021_treatmentemission'),
    ]

    operations = [
        migrations.AddField(
            model_name='processgroup',
            name='co2',
            field=models.FloatField(default=0),
        ),
    ]
