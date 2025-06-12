from rest_framework import serializers
from .models import Role, User, Route

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'
        read_only_fields = ('user',)  #user только для чтения

    def create(self, validated_data):
        #Автоматически устанавливаем текущего пользователя
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
