from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.
class NoLogAdmin(admin.ModelAdmin):
    def log_addition(self, *args, **kwargs): return None
    def log_change(self, *args, **kwargs): return None
    def log_deletion(self, *args, **kwargs): return None


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Fields to display in the admin list view
    list_display = ('username', 'email', 'user_type', 'phone_number', 'is_staff')
    
    # Filter options on the right sidebar
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active')
    
    # Grouping fields in the edit/add user forms
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Contact', {'fields': ('user_type', 'phone_number')}),
    )
    
    # Fields to show when adding a new user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role & Contact', {'fields': ('user_type', 'phone_number')}),
    )

    search_fields = ('username', 'email', 'phone_number')
    ordering = ('username',)