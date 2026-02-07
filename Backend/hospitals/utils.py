# hospitals/utils.py
from datetime import timedelta, datetime

def generate_slots_logic(doctor, date, start_time, end_time, gap_minutes=30):
    from .models import Slot # Local import to prevent circular issues
    
    curr_time = datetime.combine(date, start_time)
    finish_time = datetime.combine(date, end_time)
    
    new_slots = []
    while curr_time + timedelta(minutes=gap_minutes) <= finish_time:
        # Check karo ki slot pehle se database mein hai ya nahi
        if not Slot.objects.filter(doctor=doctor, start_time=curr_time).exists():
            new_slots.append(Slot(
                doctor=doctor,
                start_time=curr_time,
                is_booked=False
            ))
        curr_time += timedelta(minutes=gap_minutes)
    
    if new_slots:
        Slot.objects.bulk_create(new_slots) # Performance ke liye best
    return len(new_slots)