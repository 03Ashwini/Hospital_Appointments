# appointments/tasks.py
from celery import shared_task
from twilio.rest import Client
import os



@shared_task
def send_appointment_sms(patient_phone, doctor_name, slot_time):
    try:
        # Number check: Agar + nahi hai toh add kar do (Basic logic)
        if not patient_phone.startswith('+'):
            patient_phone = f"+91{patient_phone}" 

        client = Client(
            os.environ.get('TWILIO_ACCOUNT_SID'),
            os.environ.get('TWILIO_AUTH_TOKEN')
        )

        message = client.messages.create(
            body=f"Confirmed! Dr. {doctor_name}, Time: {slot_time}. Token generated.",
            from_=os.environ.get('TWILIO_FROM_NUMBER'),
            to=patient_phone
        )
        return f"SMS sent! SID: {message.sid}"
    
    except Exception as e:
        return f"Twilio Error: {str(e)}"