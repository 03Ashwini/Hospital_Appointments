# payments/tasks.py
from celery import shared_task
from .models import Payment
from appointments.models import Appointment

@shared_task
def verify_payment_task(payment_id, order_id):
    try:
        # 1. Payment record dhundo
        payment = Payment.objects.get(order_id=order_id)
        
        # 2. Update payment status
        payment.payment_id = payment_id
        payment.status = 'success'
        payment.save()

        # 3. Appointment confirm karo aur TOKEN generate karo
        appointment = payment.appointment
        
        # Ye humne appointments/models.py mein banaya hai
        token = appointment.generate_token() 
        
        print(f"✅ Payment Verified. Appointment {appointment.id} confirmed with Token #{token}")
        return True
    except Exception as e:
        print(f"❌ Error in verify_payment_task: {e}")
        return False