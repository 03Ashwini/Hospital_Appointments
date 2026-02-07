from django.db import models
from appointments.models import Appointment

# Create your models here.
# payments/models.py
class Payment(models.Model):
    """
    Payment info linked to appointment
    """
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='payment')
    order_id = models.CharField(max_length=100, unique=True)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=50, default='pending')  # pending, success, failed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.appointment} - {self.status}"
