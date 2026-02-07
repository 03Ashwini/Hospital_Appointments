import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Hospital_Appointments.settings')

app = Celery('Hospital_Appointments')

# Broker aur Backend yahan specify karna force karta hai Redis ko
app.conf.update(
    broker_url='redis://127.0.0.1:6379/0',
    result_backend='redis://127.0.0.1:6379/0',
    broker_connection_retry_on_startup=True,
)

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()