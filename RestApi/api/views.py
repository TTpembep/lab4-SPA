from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.hashers import make_password, check_password
from .models import Role, User, Route
from .serializers import RoleSerializer, UserSerializer, RouteSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    http_method_names = ['get']

class UserViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class RouteViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

@api_view(['POST'])
def register(request):
    data = request.data
    login = data.get('login')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role_id = data.get('role_id')

    if User.objects.filter(login=login).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

    try:    #Проверка, существования роли
        role = Role.objects.get(id=role_id)
    except Role.DoesNotExist:
        return Response({"error": "Role does not exist"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create( #Создание нового пользователя
        login=login,
        password_hash=make_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role
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
    
    
    refresh = RefreshToken.for_user(user)   #Генерация JWT-токенов
    return Response({
        "message": "Login successful",
        "token": str(refresh.access_token),  #Основной токен для авторизации
        "refresh": str(refresh)  #Токен для обновления
    }, status=status.HTTP_200_OK)