# Generated by Django 3.0.6 on 2021-02-03 12:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0027_auto_20210201_0940'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gncode',
            name='name',
            field=models.TextField(),
        ),
    ]
