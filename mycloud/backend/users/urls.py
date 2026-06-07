from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.user_info_view, name='user-info'),
    path('list/', views.user_list_view, name='user-list'),
    path('<int:user_id>/delete/', views.delete_user_view, name='delete-user'),
    path('<int:user_id>/toggle-admin/', views.toggle_admin_view, name='toggle-admin'),
]