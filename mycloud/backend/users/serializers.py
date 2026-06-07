from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        """Валидация логина из ТЗ"""
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                'Логин: только латинские буквы и цифры, первый символ — буква, длина от 4 до 20 символов.'
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Пользователь с таким логином уже существует.')
        return value

    def validate_email(self, value):
        """Валидация email"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует.')
        return value

    def validate_password(self, value):
        """Валидация пароля из ТЗ"""
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Пароль должен содержать минимум одну заглавную букву.')
        if not re.search(r'\d', value):
            raise serializers.ValidationError('Пароль должен содержать минимум одну цифру.')
        if not re.search(r'[@$!%*?&]', value):
            raise serializers.ValidationError('Пароль должен содержать минимум один спецсимвол (@$!%*?&).')
        return value

    def validate(self, data):
        """Проверка совпадения паролей"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают.'})
        return data

    def create(self, validated_data):
        """Создание пользователя"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения информации о пользователе"""
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'date_joined']
        
class AdminUserSerializer(serializers.ModelSerializer):
    """Расширенный сериализатор для админ-панели"""
    storage_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_admin', 'date_joined', 'storage_stats']
        read_only_fields = ['id', 'date_joined']

    def get_storage_stats(self, obj):
        """Получение статистики хранилища пользователя"""
        from files.models import File
        files = File.objects.filter(user=obj)
        return {
            'total_files': files.count(),
            'total_size': sum(f.file_size for f in files),
        }