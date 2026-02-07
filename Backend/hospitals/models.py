from django.db import models
from django.conf import settings
from django.db import models
from accounts.models import User
import datetime

class Hospital(models.Model):
    """
    Hospital model with info and facilities
    """
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hospitals')
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    address = models.TextField()
    primary_image = models.ImageField(upload_to='hospitals/')
    registration_number = models.CharField(max_length=100, unique=True)
    verified = models.BooleanField(default=False)
    facilities = models.JSONField(default=list)  # ICU, Ambulance, Lab
    policies = models.JSONField(default=dict)  # cancellation, token, refund
    op_hours = models.CharField(max_length=100)  # e.g., 9AM-5PM
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    def __str__(self):
        return self.name

class Doctor(models.Model):
    """
    Doctor linked to hospital
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='doctor_profile',
        null=True, blank=True # Shuruat mein existing data ke liye
    )
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors')
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=100)
    experience_years = models.IntegerField()
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2)
    photo = models.ImageField(upload_to='doctors/')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # 🚀 SOLUTION: Function ko yahan local import karo
            from .utils import generate_slots_logic
            
            # Default slots logic
            today = datetime.date.today()
            start = datetime.time(10, 0)
            end = datetime.time(14, 0)
            
            print(f"DEBUG: Generating slots for {self.name} on {today}")
            # Ab ye function mil jayega bina crash huye
            generate_slots_logic(self, today, start, end)

    def __str__(self):
        return f"{self.name} ({self.specialization})"

class Slot(models.Model):
    """
    Doctor's individual time slots
    """
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='slots')
    start_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.doctor.name} - {self.start_time}"


class Prescription(models.Model):
    appointment = models.OneToOneField('appointments.Appointment', on_delete=models.CASCADE, related_name='prescription')
    symptoms = models.TextField()
    diagnosis = models.TextField()
    medicines = models.JSONField()  # Example: [{"name": "Paracetamol", "dosage": "1-0-1"}]
    tests_recommended = models.TextField(null=True, blank=True)
    report_file = models.FileField(upload_to='prescriptions/', null=True, blank=True) # PDF/Image upload
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.appointment.patient.username}"

