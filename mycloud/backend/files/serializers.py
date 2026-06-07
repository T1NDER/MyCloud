from rest_framework import serializers
from .models import File
from django.urls import reverse

class FileSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения файлов"""
    download_url = serializers.SerializerMethodField()
    special_download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = [
            'id', 'original_name', 'file_size', 'upload_date', 
            'last_download_date', 'comment', 'special_link',
            'download_url', 'special_download_url'
        ]
        read_only_fields = ['id', 'upload_date', 'last_download_date', 'special_link']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                reverse('file-download', kwargs={'file_id': obj.id})
            )
        return None

    def get_special_download_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                reverse('file-download-by-link', kwargs={'special_link': obj.special_link})
            )
        return None

class FileUploadSerializer(serializers.ModelSerializer):
    """Сериализатор для загрузки файла"""
    
    class Meta:
        model = File
        fields = ['file', 'comment']

    def validate_file(self, value):
        """Проверка размера файла (макс. 100MB)"""
        max_size = 100 * 1024 * 1024  
        if value.size > max_size:
            raise serializers.ValidationError('Размер файла не должен превышать 100MB')
        return value

    def create(self, validated_data):
        """Создание записи о файле"""
        request = self.context.get('request')
        file_obj = validated_data.get('file')
        
        file_instance = File.objects.create(
            user=request.user,
            original_name=file_obj.name,
            file=file_obj,
            file_size=file_obj.size,
            comment=validated_data.get('comment', '')
        )
        
        return file_instance

class FileRenameSerializer(serializers.Serializer):
    """Сериализатор для переименования файла"""
    new_name = serializers.CharField(max_length=255)
    
    def validate_new_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Имя файла не может быть пустым')
        return value.strip()

class FileCommentSerializer(serializers.Serializer):
    """Сериализатор для изменения комментария"""
    comment = serializers.CharField(max_length=1000, allow_blank=True, required=False)