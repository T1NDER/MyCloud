import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';
import { 
  FaCloud, 
  FaFolderOpen, 
  FaCog, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus 
} from 'react-icons/fa';
import './Header.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <FaCloud className="header-logo-icon" />
          <span>My Cloud</span>
        </Link>

        {isAuthenticated && (
          <nav className="header-nav">
            <Link to="/storage" className="header-nav-link">
              <FaFolderOpen /> Мои файлы
            </Link>
            {user?.is_admin && (
              <Link to="/admin" className="header-nav-link">
                <FaCog /> Админ-панель
              </Link>
            )}
          </nav>
        )}

        <div className="header-user">
          {isAuthenticated ? (
            <>
              <span className="header-username">
                Привет, <strong>{user?.username}</strong>!
              </span>
              {user?.is_admin && (
                <span className="header-admin-badge">Admin</span>
              )}
              <button 
                onClick={handleLogout}
                className="header-btn-logout"
              >
                <FaSignOutAlt /> Выйти
              </button>
            </>
          ) : (
            <div className="header-auth-links">
              <Link to="/login" className="header-auth-link">
                <FaSignInAlt /> Вход
              </Link>
              <Link to="/register" className="header-auth-link header-auth-link--primary">
                <FaUserPlus /> Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}