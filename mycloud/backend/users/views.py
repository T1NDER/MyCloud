import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, AdminUserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Настройка логгера
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Регистрация нового пользователя"""
    logger.info(f"Попытка регистрации пользователя с IP: {request.META.get('REMOTE_ADDR', 'unknown')}")
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"Пользователь успешно зарегистрирован: {user.username} (ID: {user.id})")
        return Response({
            'message': 'Пользователь успешно зарегистрирован',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    logger.warning(f"Ошибка регистрации: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Аутентификация пользователя"""
    username = request.data.get('username', 'unknown')
    logger.info(f"Попытка входа пользователя: {username} с IP: {request.META.get('REMOTE_ADDR', 'unknown')}")
    
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            logger.info(f"Успешный вход пользователя: {user.username} (ID: {user.id})")
            return Response({
                'message': 'Успешный вход',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Неудачная попытка входа для пользователя: {username}")
            return Response({
                'error': 'Неверный логин или пароль'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    logger.warning(f"Ошибка валидации при входе: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Выход из системы"""
    logger.info(f"Пользователь вышел из системы: {request.user.username} (ID: {request.user.id})")
    logout(request)
    return Response({
        'message': 'Вы успешно вышли из системы'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info_view(request):
    """Получение информации о текущем пользователе"""
    logger.info(f"Запрос информации о пользователе: {request.user.username} (ID: {request.user.id})")
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list_view(request):
    """Получение списка всех пользователей с информацией о хранилищах (только для админов)"""
    logger.info(f"Администратор {request.user.username} запросил список всех пользователей")
    users = User.objects.all().order_by('-date_joined')
    serializer = AdminUserSerializer(users, many=True)
    logger.info(f"Получен список из {users.count()} пользователей")
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user_view(request, user_id):
    """Удаление пользователя (только для админов)"""
    logger.info(f"Администратор {request.user.username} пытается удалить пользователя ID: {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
        if user == request.user:
            logger.warning(f"Администратор {request.user.username} попытался удалить самого себя")
            return Response({
                'error': 'Нельзя удалить самого себя'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        username = user.username
        user.delete()
        logger.info(f"Администратор {request.user.username} удалил пользователя: {username} (ID: {user_id})")
        return Response({
            'message': 'Пользователь удален'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        logger.warning(f"Попытка удалить несуществующего пользователя ID: {user_id}")
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_admin_view(request, user_id):
    """Изменение статуса администратора (только для админов)"""
    logger.info(f"Администратор {request.user.username} пытается изменить права пользователя ID: {user_id}")
    
    try:
        user = User.objects.get(id=user_id)
        if user == request.user:
            logger.warning(f"Администратор {request.user.username} попытался изменить свои права")
            return Response({
                'error': 'Нельзя изменить свои права'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_admin = not user.is_admin
        user.save()
        
        status_text = "получил" if user.is_admin else "потерял"
        logger.info(f"Администратор {request.user.username} изменил права пользователя {user.username}: {status_text} права администратора")
        
        return Response({
            'message': f'Статус администратора изменен',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        logger.warning(f"Попытка изменить права несуществующего пользователя ID: {user_id}")
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)