import multiprocessing


bind = "unix:/home/dmitrii/MyCloud/mycloud/backend/mycloud.sock"

workers = 1  

worker_class = "sync"

timeout = 120
keepalive = 5

accesslog = "/home/dmitrii/MyCloud/mycloud/backend/gunicorn_access.log"
errorlog = "/home/dmitrii/MyCloud/mycloud/backend/gunicorn_error.log"
loglevel = "info"

access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

preload_app = False

graceful_timeout = 30

max_requests = 1000
max_requests_jitter = 50

raw_env = [
    'DJANGO_SETTINGS_MODULE=mycloud.settings',
    'PATH=/home/dmitrii/MyCloud/mycloud/backend/venv/bin',
]

def on_starting(server):
    print("=" * 50)
    print("🚀 Gunicorn запускается...")
    print("=" * 50)

def when_ready(server):
    print("✅ Gunicorn готов к работе!")

def when_reload(server):
    print("🔄 Перезагрузка Gunicorn...")