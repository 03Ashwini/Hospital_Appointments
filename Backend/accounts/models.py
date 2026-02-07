from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model with roles:
    - patient
    - hospital admin
    - superadmin
    """
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('hospital_admin', 'Hospital Admin'),
        ('superadmin', 'Super Admin'),
    )

   
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)

    # Fix for group/permission reverse accessor clash
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return f"{self.username} ({self.user_type})"
