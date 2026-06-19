echo "  Начало деплоя MyCloud"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' 

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Переход в директорию проекта..."
cd /home/dmitrii/MyCloud/mycloud/backend || { log_error "Не удалось перейти в директорию backend"; exit 1; }

log_info "Активация виртуального окружения..."
source venv/bin/activate || { log_error "Не удалось активировать venv"; exit 1; }

log_info "Установка зависимостей..."
pip install -r requirements.txt || { log_error "Ошибка установки зависимостей"; exit 1; }

log_info "Применение миграций базы данных..."
python manage.py migrate || { log_error "Ошибка применения миграций"; exit 1; }

log_info "Сборка статических файлов..."
python manage.py collectstatic --noinput || { log_warning "Предупреждение при сборке статики"

log_info "Проверка проекта..."
python manage.py check || { log_error "Ошибка проверки проекта"; exit 1; }

log_info "Перезапуск сервисов..."
sudo systemctl restart mycloud || { log_error "Ошибка перезапуска mycloud"; exit 1; }
sudo systemctl restart nginx || { log_error "Ошибка перезапуска nginx"; exit 1; }

log_info "Проверка статуса сервисов..."
sudo systemctl status mycloud --no-pager | head -3
sudo systemctl status nginx --no-pager | head -3

echo "============================================"
log_info "✅ Деплой завершён успешно!"
echo "============================================"
echo ""
echo " Статистика проекта:"
echo "  - Файлов в хранилище: $(python manage.py shell -c 'from files.models import File; print(File.objects.count())')"
echo "  - Пользователей: $(python manage.py shell -c 'from django.contrib.auth import get_user_model; User=get_user_model(); print(User.objects.count())')"
echo ""
echo "Сайт доступен по: http://89.108.76.150"
echo "Логи: tail -f /home/dmitrii/MyCloud/mycloud/backend/mycloud.log"