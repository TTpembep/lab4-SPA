# Generated by Django 5.2.1 on 2025-06-13 03:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_role_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='route',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='route',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='role',
            name='type',
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name='route',
            name='current_path',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterField(
            model_name='route',
            name='description',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='route',
            name='planned_path',
            field=models.CharField(max_length=20),
        ),
        migrations.AlterField(
            model_name='route',
            name='status',
            field=models.CharField(max_length=20),
        ),
    ]
