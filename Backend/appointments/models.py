from django.db import models
from django.db import models
from accounts.models import User
from hospitals.models import Hospital, Doctor, Slot
from django.db.models import Max 
# Create your models here.

class Appointment(models.Model):
    """
    Updated Appointment model: Token generates only after payment confirmation.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),      # Default state
        ('confirmed', 'Confirmed'),  # After Payment
        ('completed', 'Completed'),  # After Doctor Visit
        ('cancelled', 'Cancelled'),  # If cancelled
    )
    QUEUE_CHOICES = (
        ('waiting', 'Waiting'),
        ('in_consultation', 'In Consultation'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    )

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name='booked_appointment', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    token_no = models.PositiveIntegerField(null=True, blank=True)
    queue_status = models.CharField(max_length=20, choices=QUEUE_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)

   

    def generate_token(self):
        if not self.token_no:
            if not self.slot:
                return None
            
            # 1. Aaj ki date nikaalo
            appointment_date = self.slot.start_time.date()
            
            # 2. Aaj ke din, ISS DOCTOR ke liye highest token number dhoondo
            last_token = Appointment.objects.filter(
                doctor=self.doctor,
                slot__start_time__date=appointment_date,
                status__in=['confirmed', 'completed']
            ).aggregate(Max('token_no'))['token_no__max'] # 👈 Sabse bada number uthao

            # 3. Agar koi purana token hai toh +1, warna pehla patient (1)
            self.token_no = (last_token or 0) + 1
            self.status = 'confirmed'
            self.save()

            # SMS Task logic (Aapka logic sahi hai, bas safe import rakha hai)
            try:
                from .tasks import send_appointment_sms
                send_appointment_sms.delay(
                    patient_phone=self.patient.phone_number, 
                    doctor_name=self.doctor.name,
                    slot_time=self.slot.start_time.strftime("%I:%M %p") # Sundar format
                )
            except Exception as e:
                print(f"SMS Task Error: {e}")

        return self.token_no