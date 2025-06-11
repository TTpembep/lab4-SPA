from django.db import models

class Role(models.Model):
    type = models.CharField(max_length=30)

class User(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    login = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=128)

class Route(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    planned_path = models.CharField(max_length=20)
    current_path = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
