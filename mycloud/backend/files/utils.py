import uuid
import os
from django.conf import settings

def generate_unique_filename(original_filename):
    """Генерирует уникальное имя файла"""
    ext = original_filename.split('.')[-1] if '.' in original_filename else ''
    unique_name = f"{uuid.uuid4()}.{ext}" if ext else uuid.uuid4().hex
    return unique_name

def generate_special_link():
    """Генерирует UUID для специальной ссылки"""
    return uuid.uuid4()

def get_user_storage_path(user):
    """Возвращает путь к хранилищу пользователя"""
    return os.path.join(settings.MEDIA_ROOT, f"user_{user.id}")

def ensure_user_storage_exists(user):
    """Создает папку хранилища пользователя, если не существует"""
    storage_path = get_user_storage_path(user)
    os.makedirs(storage_path, exist_ok=True)
    return storage_path