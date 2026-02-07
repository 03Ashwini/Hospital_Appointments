from django.contrib import admin
from .models import Hospital, Doctor, Slot, Prescription

class NoLogAdmin(admin.ModelAdmin):
    def log_addition(self, *args, **kwargs): return None
    def log_change(self, *args, **kwargs): return None
    def log_deletion(self, *args, **kwargs): return None

@admin.register(Hospital)
class HospitalAdmin(NoLogAdmin):
    list_display = ('name', 'city', 'verified')

@admin.register(Doctor)
class DoctorAdmin(NoLogAdmin):
    list_display = ('name', 'specialization', 'hospital')

@admin.register(Slot)
class SlotAdmin(NoLogAdmin):
    list_display = ('doctor', 'start_time', 'is_booked')
    list_filter = ('is_booked', 'doctor')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'created_at')