from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Кастомная аутентификация, которая не проверяет CSRF.
    Подходит для SPA, где CSRF проверка не нужна.
    """
    def enforce_csrf(self, request):
        return  