# My Cloud - Облачное хранилище

## Описание
Веб-приложение для работы с файлами в облаке.

## Технологии
- Backend: Python 3.10+, Django 4.2+, PostgreSQL
- Frontend: React 18+, Redux, React Router
- Деплой: reg.ru

## Установка

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver