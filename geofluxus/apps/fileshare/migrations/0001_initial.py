# Generated by Django 3.0.6 on 2021-05-24 08:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('asmfa', '0030_auto_20210203_1214'),
    ]

    operations = [
        migrations.CreateModel(
            name='SharedFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('url', models.URLField(blank=True, null=True)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='asmfa.Dataset')),
            ],
        ),
    ]