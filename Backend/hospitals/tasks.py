# hospitals/tasks.py
from celery import shared_task
from datetime import date, timedelta, time
from .models import Doctor
from .utils import generate_slots_logic

# hospitals/tasks.py
@shared_task
def daily_slot_generator():
    from datetime import date, timedelta, time
    doctors = Doctor.objects.all()
    
    # 🚀 LOOP: Aaj (0) se lekar agle 7 din tak ke slots check karo
    for i in range(0, 8): 
        target_date = date.today() + timedelta(days=i)
        
        for doctor in doctors:
            generate_slots_logic(
                doctor=doctor, 
                date=target_date, 
                start_time=time(10, 0), 
                end_time=time(17, 0)
            )
    return "Slots generated for the next 7 days including TODAY!"