from rest_framework import serializers
from .models import Role, User, Route

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'type']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'role', 'first_name', 'last_name', 'login', 'password_hash']

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['route_id', 'user', 'description', 'planned_path', 'current_path', 'status']