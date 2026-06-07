from django.urls import path
from . import views

urlpatterns = [
    path('', views.file_list_view, name='file-list'),
    path('upload/', views.file_upload_view, name='file-upload'),
    path('<int:file_id>/download/', views.file_download_view, name='file-download'),
    path('<int:file_id>/delete/', views.file_delete_view, name='file-delete'),
    path('<int:file_id>/rename/', views.file_rename_view, name='file-rename'),
    path('<int:file_id>/comment/', views.file_comment_view, name='file-comment'),
    path('shared/<uuid:special_link>/download/', views.file_download_by_link_view, name='file-download-by-link'),
    path('stats/<int:user_id>/', views.user_storage_stats_view, name='user-storage-stats'),  # Добавлено!
]