import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles, uploadFile, deleteFile, renameFile } from '../../store/slices/fileSlice';
import { 
  FaCloudUploadAlt, 
  FaDownload, 
  FaEdit, 
  FaLink, 
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaFolderOpen
} from 'react-icons/fa';
import './Storage.css';

export default function Storage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');
  
  const dispatch = useDispatch();
  const { files, isLoading, error } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Выберите файл для загрузки');
      return;
    }

    await dispatch(uploadFile({ file: selectedFile, comment }));
    setSelectedFile(null);
    setComment('');
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      await dispatch(deleteFile(fileId));
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
    const fullLink = `api/files/shared/${specialLink}/download/`;
    navigator.clipboard.writeText(fullLink);
    alert('Ссылка скопирована в буфер обмена');
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await fetch(`api/files/${fileId}/download/`, {
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

  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);

  return (
    <div className="storage-page">
      <div className="storage-header">
        <h1 className="storage-title">Моё файловое хранилище</h1>
        <div className="storage-stats">
          <div className="storage-stat">
            <div className="storage-stat-label">Файлов</div>
            <div className="storage-stat-value">{files.length}</div>
          </div>
          <div className="storage-stat">
            <div className="storage-stat-label">Общий размер</div>
            <div className="storage-stat-value">{formatFileSize(totalSize)}</div>
          </div>
        </div>
      </div>

      <div className="upload-card">
        <h3 className="upload-title"><FaCloudUploadAlt style={{ marginRight: '0.5rem' }} />Загрузить новый файл</h3>
        
        <div className="upload-form">
          <div>
            <input
              type="file"
              onChange={handleFileSelect}
              className="upload-file-input"
            />
            {selectedFile && (
              <div className="upload-file-selected">
                <span>📄</span>
                <span className="upload-file-name">{selectedFile.name}</span>
                <span className="upload-file-size">({formatFileSize(selectedFile.size)})</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Комментарий (необязательно)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте описание к файлу..."
              className="form-textarea"
            />
          </div>

          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={isLoading || !selectedFile}
              className="btn btn-success btn-lg"
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Загрузка...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt /> Загрузить файл
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Список файлов */}
      <div className="files-section">
        <div className="files-header">
          <h3 className="files-title">
            Загруженные файлы
            <span className="files-count">{files.length}</span>
          </h3>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {JSON.stringify(error)}
          </div>
        )}

        {files.length === 0 ? (
          <div className="files-empty">
            <div className="files-empty-icon"><FaFolderOpen /></div>
            <p>У вас пока нет загруженных файлов</p>
            <p className="text-small text-muted">Загрузите первый файл, чтобы начать работу</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Имя файла</th>
                  <th>Размер</th>
                  <th>Загружен</th>
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
        )}
      </div>
    </div>
  );
}