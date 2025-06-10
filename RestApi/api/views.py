from rest_framework import generics
from .models import Role, User, Route
from .serializers import RoleSerializer, UserSerializer, RouteSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

class RegisterView(APIView):    #Создание пользоватея
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        if User.objects.filter(login=data.get('login')).exists():
            return Response({'detail': 'Пользователь с таким логином уже существует.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User(
            role_id=data.get('role'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            login=data.get('login'),
            password_hash=make_password(data.get('password'))
        )
        user.save()
        return Response({'detail': 'Регистрация успешна.'}, status=status.HTTP_201_CREATED)

class LoginView(APIView):   #Вход
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        login = request.data.get('login')
        password = request.data.get('password')
        try:
            user = User.objects.get(login=login)
        except User.DoesNotExist:
            return Response({'detail': 'Неверный логин или пароль.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not check_password(password, user.password_hash):
            return Response({'detail': 'Неверный логин или пароль.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.user_id,
        }, status=status.HTTP_200_OK)

class ProfileView(APIView): #Просмотр профиля
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# Role
class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]

class RoleRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

# User
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# Route
class RouteListCreateView(generics.ListCreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

class RouteRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]