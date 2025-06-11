from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from .models import Role, User, Route
from .serializers import RoleSerializer, UserSerializer, RouteSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

@api_view(['POST'])
def register(request):
    data = request.data
    login = data.get('login')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role_id = data.get('role_id')  # Получаем role_id из данных запроса

    if User.objects.filter(login=login).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

    # Проверяем, существует ли роль с данным role_id
    try:
        role = Role.objects.get(id=role_id)
    except Role.DoesNotExist:
        return Response({"error": "Role does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    # Создаем нового пользователя с указанной ролью
    user = User.objects.create(
        login=login,
        password_hash=make_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role  # Устанавливаем роль пользователя
    )

    return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    data = request.data
    login = data.get('login')
    password = data.get('password')
    try:
        user = User.objects.get(login=login)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    if not check_password(password, user.password_hash):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
