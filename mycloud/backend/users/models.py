from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
import os

login_validator = RegexValidator(
    regex=r'^[a-zA-Z][a-zA-Z0-9]{3,19}$',
    message='Логин: только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов.'
)

password_validator = RegexValidator(
    regex=r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$',
    message='Пароль: мин. 6 символов, минимум 1 заглавная буква, 1 цифра и 1 спецсимвол.'
)

class CustomUser(AbstractUser):
    full_name = models.CharField(max_length=150, verbose_name="Полное имя")
    email = models.EmailField(unique=True, verbose_name="Email")
    is_admin = models.BooleanField(default=False, verbose_name="Администратор")
    
    username = models.CharField(
        max_length=20, 
        unique=True, 
        validators=[login_validator],
        verbose_name="Логин"
    )
    
    password = models.CharField(
        max_length=128, 
        validators=[password_validator], 
        verbose_name="Пароль"
    )

    @property
    def storage_path(self):
        """Возвращает уникальный путь к папке пользователя"""
        return f"user_{self.id}"

    def __str__(self):
        return self.username