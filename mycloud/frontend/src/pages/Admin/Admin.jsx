import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchFiles } from '../../store/slices/fileSlice';
import FileList from '../../components/FileList/FileList';
import UserList from '../../components/UserList/UserList';
import { FaCog, FaArrowLeft, FaFolder, FaUserShield, FaBan } from 'react-icons/fa';
import './Admin.css';

export default function Admin() {
  const [viewingUser, setViewingUser] = useState(null);
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleViewFiles = (userId, username) => {
    setViewingUser({ id: userId, username });
    dispatch(fetchFiles(userId));
  };

  const handleBackToUsers = () => {
    setViewingUser(null);
    dispatch(fetchUsers());
  };

  if (!currentUser?.is_admin) {
    return (
      <div className="admin-page">
        <div className="admin-access-denied">
          <div className="admin-access-denied-icon">
            <FaBan />
          </div>
          <h2 className="admin-access-denied-title">Доступ запрещен</h2>
          <p className="admin-access-denied-text">
            У вас нет прав администратора для просмотра этой страницы.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title"><FaCog style={{ marginRight: '0.5rem' }} />Админ-панель</h1>
      </div>

      {viewingUser ? (
        <div className="admin-section fade-in">
          <button 
            onClick={handleBackToUsers}
            className="btn btn-secondary admin-back-btn"
          >
            <FaArrowLeft /> Назад к списку пользователей
          </button>
          
          <h2 className="admin-section-title">
            <FaFolder style={{ marginRight: '0.5rem' }} />Файлы пользователя: <strong>{viewingUser.username}</strong>
          </h2>
          <FileList userId={viewingUser.id} isAdmin={true} />
        </div>
      ) : (
        <div className="admin-section fade-in">
          <h2 className="admin-section-title">
            <FaUserShield style={{ marginRight: '0.5rem' }} />Список пользователей
          </h2>
          <UserList onViewFiles={handleViewFiles} />
        </div>
      )}
    </div>
  );
}