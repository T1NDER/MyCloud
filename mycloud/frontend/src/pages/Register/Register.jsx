import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../../store/slices/authSlice';
import '../../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(registerUser(formData));
    if (result.type === 'auth/register/fulfilled') {
      navigate('/storage');
    }
  };

  const formatErrors = (errors) => {
    if (typeof errors === 'string') return errors;
    if (typeof errors === 'object') {
      return Object.entries(errors)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('; ');
    }
    return 'Ошибка регистрации';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Регистрация</h2>
          <p className="auth-subtitle">Создайте аккаунт для использования My Cloud</p>
          
          {error && (
            <div className="auth-error">
              {formatErrors(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Логин *</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Только латинские буквы и цифры"
              />
              <p className="form-hint">4-20 символов, начинается с буквы</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Полное имя *</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Иван Иванов"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="example@mail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Пароль *</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
                placeholder="Минимум 6 символов"
              />
              <p className="form-hint">Заглавная буква, цифра и спецсимвол (@$!%*?&)</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password_confirm">Подтверждение пароля *</label>
              <input
                id="password_confirm"
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Повторите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block btn-lg"
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}