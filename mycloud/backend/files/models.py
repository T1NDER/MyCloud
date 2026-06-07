import uuid
import os
from django.db import models
from django.conf import settings

def user_directory_path(instance, filename):
    """Сохраняет файл в папку пользователя с уникальным именем"""
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join(instance.user.storage_path, unique_filename)

class File(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='files',
        verbose_name="Владелец"
    )
    original_name = models.CharField(max_length=255, verbose_name="Оригинальное имя")
    file = models.FileField(upload_to=user_directory_path, verbose_name="Файл")
    file_size = models.BigIntegerField(verbose_name="Размер (байты)")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")
    last_download_date = models.DateTimeField(null=True, blank=True, verbose_name="Последнее скачивание")
    comment = models.TextField(blank=True, null=True, verbose_name="Комментарий")
    
    special_link = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name="Спец. ссылка")

    def __str__(self):
        return self.original_name