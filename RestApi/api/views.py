from rest_framework import viewsets, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.hashers import make_password, check_password
from .models import Role, User, Route
from .serializers import RoleSerializer, UserSerializer, RouteSerializer
from django.core.exceptions import ObjectDoesNotExist

from django.db.models import F
import random
import string

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

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_routes(request):
    try:
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Получаем все маршруты текущего пользователя
        routes = Route.objects.filter(user=request.user.id)  # Используем request.user.id
        
        if not routes.exists():
            return Response({"message": "No routes found for this user"}, status=status.HTTP_200_OK)
        
        updated_routes = []
        for route in routes:
            if route.status == "done":
                route.save()
                updated_routes.append(route)
                break
            # Добавляем случайный знак к текущему пути
            directions = ['N', 'E', 'S', 'W']  # Север, Восток, Юг, Запад
            new_direction = random.choice(directions)
            route.current_path += new_direction
            
            # Проверяем отклонение от маршрута
            deviation = calculate_deviation(route.planned_path, route.current_path)
            if deviation == -1:
                route.status = "done"
            elif deviation > 2:
                route.status = "emergency"
            elif deviation > 1:
                route.status = "alert"
            elif deviation > 0:
                route.status = "warning"
            else:
                route.status = "normal"
            
            route.save()
            updated_routes.append(route)
        
        serializer = RouteSerializer(updated_routes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def calculate_deviation(planned, current):
    """Вычисляет отклонение текущего пути от запланированного"""
    min_len = min(len(planned), len(current))
    deviation = 0
    
    for i in range(min_len):
        if planned[i] != current[i]:
            deviation += 1
    if (len(planned) == len(current) and deviation == 0):
        return -1
    #deviation += abs(len(planned) - len(current))
    return deviation