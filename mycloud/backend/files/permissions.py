from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """Разрешает доступ только владельцу объекта или администратору"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and request.user.is_admin:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

class IsAuthenticatedOrSharedLink(permissions.BasePermission):
    """Разрешает доступ аутентифицированным пользователям или по специальной ссылке"""
    
    def has_permission(self, request, view):
        if 'special_link' in request.query_params:
            return True
        return request.user.is_authenticated