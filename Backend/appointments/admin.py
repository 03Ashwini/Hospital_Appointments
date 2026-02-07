from django.contrib import admin
from django.contrib import admin
from .models import Appointment
# Register your models here.

class NoLogAdmin(admin.ModelAdmin):
    def log_addition(self, *args, **kwargs): return None
    def log_change(self, *args, **kwargs): return None
    def log_deletion(self, *args, **kwargs): return None

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    # Track booking status and tokens
    list_display = ('id', 'token_no', 'patient', 'doctor', 'status', 'queue_status')
    list_filter = ('status', 'queue_status', 'created_at')
    search_fields = ('patient__username', 'doctor__name', 'token_no')
    
    # Admin action to confirm booking and trigger token generation logic
    actions = ['confirm_and_generate_token']

    def confirm_and_generate_token(self, request, queryset):
        for appointment in queryset:
            if appointment.status == 'pending':
                token = appointment.generate_token() # Triggers the logic in models.py
                self.message_user(request, f"Confirmed: Token {token} issued for {appointment.patient.username}")
            else:
                self.message_user(request, f"Skipped: Appointment {appointment.id} is already processed.", level='warning')
    
    confirm_and_generate_token.short_description = "Confirm Selected & Generate Tokens"