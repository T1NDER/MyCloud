import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCloudUploadAlt, 
  FaLink, 
  FaShieldAlt, 
  FaBolt,
  FaFolder,
  FaArrowRight
} from 'react-icons/fa';
import './Home.css';

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="home">
      <div className="home-container">
        <h1 className="home-title">Добро пожаловать в My Cloud</h1>
        <p className="home-subtitle">
          Надежное облачное хранилище для ваших файлов. 
          Загружайте, храните и делитесь файлами с друзьями.
        </p>

        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">
              <FaCloudUploadAlt />
            </div>
            <h3 className="home-feature-title">Загрузка файлов</h3>
            <p className="home-feature-text">
              Загружайте файлы любого формата с удобной системой управления
            </p>
          </div>

          <div className="home-feature">
            <div className="home-feature-icon">
              <FaLink />
            </div>
            <h3 className="home-feature-title">Поделиться ссылкой</h3>
            <p className="home-feature-text">
              Делитесь файлами через специальные ссылки без регистрации
            </p>
          </div>

          <div className="home-feature">
            <div className="home-feature-icon">
              <FaShieldAlt />
            </div>
            <h3 className="home-feature-title">Безопасность</h3>
            <p className="home-feature-text">
              Ваши файлы защищены и доступны только вам
            </p>
          </div>

          <div className="home-feature">
            <div className="home-feature-icon">
              <FaBolt />
            </div>
            <h3 className="home-feature-title">Быстрый доступ</h3>
            <p className="home-feature-text">
              Мгновенный доступ к файлам с любого устройства
            </p>
          </div>
        </div>

        <div className="home-actions">
          {isAuthenticated ? (
            <Link to="/storage" className="btn btn-primary btn-lg">
              <FaFolder /> Перейти к файлам
              <FaArrowRight />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Начать бесплатно
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Войти
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}