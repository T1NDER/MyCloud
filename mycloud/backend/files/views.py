import os
import shutil
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_list_view(request):
    """Получение списка файлов пользователя"""
    user_id = request.query_params.get('user_id')

    if user_id and request.user.is_admin:
        files = File.objects.filter(user_id=user_id).order_by('-upload_date')
    else:
        files = File.objects.filter(user=request.user).order_by('-upload_date')
    
    serializer = FileSerializer(files, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_upload_view(request):
    """Загрузка файла"""
    serializer = FileUploadSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        file_instance = serializer.save()
        
        ensure_user_storage_exists(request.user)
        
        return Response({
            'message': 'Файл успешно загружен',
            'file': FileSerializer(file_instance, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_download_view(request, file_id):
    """Скачивание файла"""
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        from django.utils import timezone
        file_obj.last_download_date = timezone.now()
        file_obj.save()
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
        
        return response
    
    except File.DoesNotExist:
        raise Http404("Файл не найден")
    except Exception as e:
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
        
        response = FileResponse(
            open(file_obj.file.path, 'rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
        
        return response
    
    except File.DoesNotExist:
        raise Http404("Файл не найден или ссылка недействительна")
    except Exception as e:
        return Response({
            'error': f'Ошибка при скачивании: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def file_delete_view(request, file_id):
    """Удаление файла"""
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if os.path.exists(file_obj.file.path):
            os.remove(file_obj.file.path)
        
        file_obj.delete()
        
        return Response({
            'message': 'Файл успешно удален'
        }, status=status.HTTP_200_OK)
    
    except File.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def file_rename_view(request, file_id):
    """Переименование файла"""
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
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
            
            return Response({
                'message': 'Файл переименован',
                'file': FileSerializer(file_obj, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except File.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def file_comment_view(request, file_id):
    """Изменение комментария к файлу"""
    try:
        file_obj = File.objects.get(id=file_id)
        
        if file_obj.user != request.user and not request.user.is_admin:
            return Response({
                'error': 'Нет доступа к этому файлу'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = FileCommentSerializer(data=request.data)
        if serializer.is_valid():
            file_obj.comment = serializer.validated_data.get('comment', '')
            file_obj.save()
            
            return Response({
                'message': 'Комментарий обновлен',
                'file': FileSerializer(file_obj, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except File.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_storage_stats_view(request, user_id):
    """Получение статистики хранилища пользователя (для админов)"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.user != target_user and not request.user.is_admin:
        return Response({
            'error': 'Нет доступа'
        }, status=status.HTTP_403_FORBIDDEN)
    
    files = File.objects.filter(user=target_user)
    total_files = files.count()
    total_size = sum(f.file_size for f in files)
    
    return Response({
        'user_id': target_user.id,
        'username': target_user.username,
        'total_files': total_files,
        'total_size': total_size,
    }, status=status.HTTP_200_OK)