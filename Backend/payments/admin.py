from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Payment
class NoLogAdmin(admin.ModelAdmin):
    def log_addition(self, *args, **kwargs): return None
    def log_change(self, *args, **kwargs): return None
    def log_deletion(self, *args, **kwargs): return None

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # Admin list mein ye fields dikhengi
    list_display = ('order_id', 'appointment', 'amount', 'status', 'created_at')
    
    # Status ke hisaab se filter karne ke liye
    list_filter = ('status', 'created_at')
    
    # Order ID ya Appointment se search karne ke liye
    search_fields = ('order_id', 'payment_id', 'appointment__patient__username')
    
    # Taaki admin panel se data change na ho sake (read only)
    readonly_fields = ('created_at',)