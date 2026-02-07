# hospitals/serializers.py
from rest_framework import serializers
from .models import Hospital, Doctor
from rest_framework import serializers
from .models import Slot

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        exclude = ['admin', 'verified']   # 👈 admin body se nahi aayega




class DoctorSerializer(serializers.ModelSerializer):
    # Username field from the linked User model
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'name', 'username', 'specialization', 'experience_years', 'consultation_fee', 'photo']

class SlotSerializer(serializers.ModelSerializer):
    # Time ko human-readable banane ke liye (e.g., "10:30 AM")
    start_time_display = serializers.DateTimeField(source='start_time', format="%I:%M %p", read_only=True)
    date_display = serializers.DateTimeField(source='start_time', format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Slot
        fields = ['id', 'doctor', 'start_time', 'is_booked', 'start_time_display', 'date_display']