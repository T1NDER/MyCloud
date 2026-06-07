import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, toggleAdmin, fetchUsers } from '../../store/slices/userSlice';
import { 
  FaFolder, 
  FaUserShield, 
  FaUser, 
  FaTrashAlt 
} from 'react-icons/fa';
import '../../styles/global.css';

export default function UserList({ onViewFiles }) {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${username}?`)) {
      await dispatch(deleteUser(userId));
      dispatch(fetchUsers());
    }
  };

  const handleToggleAdmin = async (userId, username, currentStatus) => {
    const action = currentStatus ? 'снять права администратора' : 'назначить администратором';
    if (window.confirm(`Вы уверены, что хотите ${action} для ${username}?`)) {
      await dispatch(toggleAdmin(userId));
      dispatch(fetchUsers());
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: '3rem' }}>
        <span className="spinner"></span>
        <span style={{ marginLeft: '1rem' }}>Загрузка...</span>
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

  if (users.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem', color: 'var(--gray-500)' }}>
        Нет пользователей
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th style={{ textAlign: 'center' }}>Статус</th>
            <th style={{ textAlign: 'center' }}>Файлы</th>
            <th style={{ textAlign: 'center' }}>Размер</th>
            <th style={{ textAlign: 'center' }}>Регистрация</th>
            <th style={{ textAlign: 'center' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <strong>{user.username}</strong>
              </td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td style={{ textAlign: 'center' }}>
                {user.is_admin ? (
                  <span className="user-admin-badge">Admin</span>
                ) : (
                  <span className="user-regular-badge">User</span>
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                <div className="storage-info">
                  <span className="storage-files-count">
                    {user.storage_stats?.total_files || 0}
                  </span>
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>
                {formatFileSize(user.storage_stats?.total_size || 0)}
              </td>
              <td style={{ textAlign: 'center' }} className="text-small">
                {formatDate(user.date_joined)}
              </td>
              <td>
                <div className="table-actions">
                  <button 
                    onClick={() => onViewFiles(user.id, user.username)}
                    className="btn btn-outline btn-icon"
                    title="Просмотреть файлы"
                  >
                    <FaFolder />
                  </button>
                  {user.id !== currentUser?.id && (
                    <>
                      <button 
                        onClick={() => handleToggleAdmin(user.id, user.username, user.is_admin)}
                        className="btn btn-warning btn-icon"
                        title={user.is_admin ? 'Снять права админа' : 'Назначить админом'}
                      >
                        {user.is_admin ? <FaUser /> : <FaUserShield />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.username)}
                        className="btn btn-danger btn-icon"
                        title="Удалить пользователя"
                      >
                        <FaTrashAlt />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}