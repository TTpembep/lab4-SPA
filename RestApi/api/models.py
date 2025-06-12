from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password

class UserManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError('Users must have a login')
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Role(models.Model):
    type = models.CharField(max_length=30)

class User(AbstractBaseUser):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    login = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=128)

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self):
        return self.login

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)

class Route(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    planned_path = models.CharField(max_length=20)
    current_path = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
