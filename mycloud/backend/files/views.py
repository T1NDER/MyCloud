import os
import shutil
import logging
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import File
from .serializers import (
    FileSerializer, FileUploadSerializer, 
    FileRenameSerializer, FileCommentSerializer
)
from .permissions import IsOwnerOrAdmin
from .utils import generate_unique_filename, ensure_user_storage_exists

# Настройка логгера
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_list_view(request):
    """Получение списка файлов пользователя"""
    user_id = request.query_params.get('user_id')

    if user_id and request.user.is_admin:
        files = File.objects.filter(user_id=user_id).order_by('-upload_date')
        logger.info(f"Администратор {request.user.username} запросил файлы пользователя ID: {user_id}")
    else:
        files = File.objects.filter(user=request.user).order_by('-upload_date')
        logger.info(f"Пользователь {request.user.username} запросил свои файлы")
    
    serializer = FileSerializer(files, many=True, context={'request': request})
    logger.info(f"Получено {files.count()} файлов")
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_upload_view(request):
    """Загрузка файла"""
    logger.info(f"Пользователь {request.user.username} начинает загрузку файла")
    
    serializer = FileUploadSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        file_instance = serializer.save()
        
        ensure_user_storage_exists(request.user)
        
        logger.info(
            f"Пользователь {request.user.username} загрузил файл: "
            f"{file_instance.original_name} (ID: {file_instance.id}, "
            f"размер: {file_instance.file_size} байт)"
        )
        
        return Response({
            'message': 'Файл успешно загружен',
            'file': FileSerializer(file_instance, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    logger.warning(f"Ошибка загрузки файла пользователем {request.user.username}: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_download_view(request, file_id):
    """Скачивание файла"""
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            logger.warning(
                f"Пользователь {request.user.username} попытался скачать "
                f"чужой файл ID: {file_id} (владелец: {file_obj.user.username})"
            )
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        from django.utils import timezone
        file_obj.last_download_date = timezone.now()
        file_obj.save()
        
        logger.info(
            f"Пользователь {request.user.username} скачал файл: "
            f"{file_obj.original_name} (ID: {file_id})"
        )
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
        
        return response
    
    except File.DoesNotExist:
        logger.warning(f"Попытка скачать несуществующий файл ID: {file_id}")
        raise Http404("Файл не найден")
    except Exception as e:
        logger.error(f"Ошибка при скачивании файла ID: {file_id}: {str(e)}")
        return Response({
            'error': f'Ошибка при скачивании: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def file_download_by_link_view(request, special_link):
    """Скачивание файла по специальной ссылке"""
    try:
        file_obj = File.objects.get(special_link=special_link)
        
        from django.utils import timezone
        file_obj.last_download_date = timezone.now()
        file_obj.save()
        
        logger.info(
            f"Скачивание файла по специальной ссылке: "
            f"{file_obj.original_name} (ID: {file_obj.id}, "
            f"владелец: {file_obj.user.username})"
        )
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
        
        return response
    
    except File.DoesNotExist:
        logger.warning(f"Попытка скачать файл по недействительной ссылке: {special_link}")
        raise Http404("Файл не найден или ссылка недействительна")
    except Exception as e:
        logger.error(f"Ошибка при скачивании по ссылке {special_link}: {str(e)}")
        return Response({
            'error': f'Ошибка при скачивании: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def file_delete_view(request, file_id):
    """Удаление файла"""
    logger.info(f"Пользователь {request.user.username} пытается удалить файл ID: {file_id}")
    
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            logger.warning(
                f"Пользователь {request.user.username} попытался удалить "
                f"чужой файл ID: {file_id} (владелец: {file_obj.user.username})"
            )
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        filename = file_obj.original_name
        
        if os.path.exists(file_obj.file.path):
            os.remove(file_obj.file.path)
        
        file_obj.delete()
        
        logger.info(
            f"Пользователь {request.user.username} удалил файл: "
            f"{filename} (ID: {file_id})"
        )
        
        return Response({
            'message': 'Файл успешно удален'
        }, status=status.HTTP_200_OK)
    
    except File.DoesNotExist:
        logger.warning(f"Попытка удалить несуществующий файл ID: {file_id}")
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def file_rename_view(request, file_id):
    """Переименование файла"""
    logger.info(f"Пользователь {request.user.username} пытается переименовать файл ID: {file_id}")
    
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            logger.warning(
                f"Пользователь {request.user.username} попытался переименовать "
                f"чужой файл ID: {file_id} (владелец: {file_obj.user.username})"
            )
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = FileRenameSerializer(data=request.data)
        if serializer.is_valid():
            new_name = serializer.validated_data['new_name']
            
            old_name = file_obj.original_name
            ext = os.path.splitext(old_name)[1]
            
            if not new_name.endswith(ext):
                new_name = new_name + ext
            
            file_obj.original_name = new_name
            file_obj.save()
            
            logger.info(
                f"Пользователь {request.user.username} переименовал файл: "
                f"'{old_name}' -> '{new_name}' (ID: {file_id})"
            )
            
            return Response({
                'message': 'Файл переименован',
                'file': FileSerializer(file_obj, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        logger.warning(f"Ошибка переименования файла ID: {file_id}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except File.DoesNotExist:
        logger.warning(f"Попытка переименовать несуществующий файл ID: {file_id}")
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def file_comment_view(request, file_id):
    """Изменение комментария к файлу"""
    logger.info(f"Пользователь {request.user.username} пытается изменить комментарий к файлу ID: {file_id}")
    
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            logger.warning(
                f"Пользователь {request.user.username} попытался изменить комментарий к "
                f"чужому файлу ID: {file_id} (владелец: {file_obj.user.username})"
            )
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = FileCommentSerializer(data=request.data)
        if serializer.is_valid():
            file_obj.comment = serializer.validated_data.get('comment', '')
            file_obj.save()
            
            logger.info(
                f"Пользователь {request.user.username} обновил комментарий к файлу: "
                f"{file_obj.original_name} (ID: {file_id})"
            )
            
            return Response({
                'message': 'Комментарий обновлен',
                'file': FileSerializer(file_obj, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        logger.warning(f"Ошибка обновления комментария к файлу ID: {file_id}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except File.DoesNotExist:
        logger.warning(f"Попытка изменить комментарий несуществующего файла ID: {file_id}")
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_storage_stats_view(request, user_id):
    """Получение статистики хранилища пользователя (для админов)"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    logger.info(f"Запрос статистики хранилища пользователя ID: {user_id}")
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"Попытка получить статистику несуществующего пользователя ID: {user_id}")
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.user != target_user and not request.user.is_admin:
        logger.warning(
            f"Пользователь {request.user.username} попытался получить статистику "
            f"чужого хранилища (пользователь ID: {user_id})"
        )
        return Response({
            'error': 'Нет доступа'
        }, status=status.HTTP_403_FORBIDDEN)
    
    files = File.objects.filter(user=target_user)
    total_files = files.count()
    total_size = sum(f.file_size for f in files)
    
    logger.info(
        f"Получена статистика хранилища пользователя {target_user.username}: "
        f"{total_files} файлов, общий размер: {total_size} байт"
    )
    
    return Response({
        'user_id': target_user.id,
        'username': target_user.username,
        'total_files': total_files,
        'total_size': total_size,
    }, status=status.HTTP_200_OK)