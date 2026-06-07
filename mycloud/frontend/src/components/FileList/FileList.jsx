import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, deleteFile, renameFile } from '../../store/slices/fileSlice';
import { 
  FaDownload, 
  FaEdit, 
  FaLink, 
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaFolderOpen
} from 'react-icons/fa';
import '../../styles/global.css';

export default function FileList({ userId = null}) {
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');
  
  const dispatch = useDispatch();
  const { files, isLoading, error } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchFiles(userId));
  }, [dispatch, userId]);

  const handleDelete = async (fileId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      await dispatch(deleteFile(fileId));
      dispatch(fetchFiles(userId));
    }
  };

  const handleRename = async (fileId) => {
    if (!newName.trim()) {
      alert('Введите новое имя файла');
      return;
    }
    await dispatch(renameFile({ fileId, newName }));
    setEditingFile(null);
    setNewName('');
    dispatch(fetchFiles(userId));
  };

  const startRename = (file) => {
    setEditingFile(file.id);
    setNewName(file.original_name);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const copyShareLink = (specialLink) => {
    const fullLink = `http://localhost:8000/api/files/shared/${specialLink}/download/`;
    navigator.clipboard.writeText(fullLink);
    alert('Ссылка скопирована в буфер обмена');
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await fetch(`http://localhost:8000/api/files/${fileId}/download/`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка скачивания');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании:', error);
      alert('Не удалось скачать файл');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: '3rem' }}>
        <span className="spinner"></span>
        <span style={{ marginLeft: '1rem' }}>Загрузка файлов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {JSON.stringify(error)}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem', color: 'var(--gray-500)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><FaFolderOpen /></div>
        <p>Нет файлов</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Имя файла</th>
            <th>Размер</th>
            <th>Загружен</th>
            <th>Последнее скачивание</th>
            <th>Комментарий</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td className="file-name-cell">
                {editingFile === file.id ? (
                  <div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="file-rename-input"
                      autoFocus
                    />
                    <div className="file-rename-actions">
                      <button 
                        onClick={() => handleRename(file.id)}
                        className="btn btn-success btn-sm"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => setEditingFile(null)}
                        className="btn btn-outline btn-sm"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  file.original_name
                )}
              </td>
              <td>{formatFileSize(file.file_size)}</td>
              <td className="text-small">{formatDate(file.upload_date)}</td>
              <td className="text-small">
                {file.last_download_date ? formatDate(file.last_download_date) : '—'}
              </td>
              <td>
                <div className="file-comment" title={file.comment}>
                  {file.comment || <span className="text-muted">—</span>}
                </div>
              </td>
              <td>
                <div className="table-actions">
                  <button 
                    onClick={() => downloadFile(file.id, file.original_name)}
                    className="btn btn-outline btn-icon"
                    title="Скачать"
                  >
                    <FaDownload />
                  </button>
                  <button 
                    onClick={() => startRename(file)}
                    className="btn btn-outline btn-icon"
                    title="Переименовать"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => copyShareLink(file.special_link)}
                    className="btn btn-outline btn-icon"
                    title="Копировать ссылку"
                  >
                    <FaLink />
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="btn btn-danger btn-icon"
                    title="Удалить"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}