from django.db import models
from django.db import models
from accounts.models import User
from hospitals.models import Hospital, Doctor
from appointments.models import Appointment

# Create your models here.

class Review(models.Model):
    """
    Verified reviews after completed appointment
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='reviews')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Only allow review if appointment completed
        completed_appointments = Appointment.objects.filter(
            patient=self.user,
            hospital=self.hospital,
            doctor=self.doctor,
            status='completed'
        )
        if not completed_appointments.exists():
            raise ValueError("Cannot review before completing appointment")
        super().save(*args, **kwargs)
