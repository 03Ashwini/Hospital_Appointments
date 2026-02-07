from django.db.models.signals import post_save
from django.dispatch import receiver
from allauth.socialaccount.models import SocialAccount
from .models import User

@receiver(post_save, sender=User)
def set_default_role(sender, instance, created, **kwargs):
    if created and not instance.user_type:
        # Check karo agar user social account (Google) se aaya hai
        if SocialAccount.objects.filter(user=instance).exists():
            instance.user_type = 'patient'  # Default role assign karo
            instance.save()