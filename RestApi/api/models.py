from django.db import models

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50)

    class Meta:
        db_table = 'roles'
        managed = False

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    role = models.ForeignKey(Role, db_column='role_id', on_delete=models.DO_NOTHING)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    login = models.CharField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)

    class Meta:
        db_table = 'users'
        managed = False

class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, db_column='user_id', on_delete=models.DO_NOTHING)
    description = models.TextField()
    planned_path = models.TextField()
    current_path = models.TextField()
    status = models.CharField(max_length=30)

    class Meta:
        db_table = 'routes'
        managed = False