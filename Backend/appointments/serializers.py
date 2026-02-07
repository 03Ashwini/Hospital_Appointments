# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
  
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    hospital_name = serializers.ReadOnlyField(source='hospital.name')
    slot_time = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'token_no', 'status', 'doctor_name', 
            'hospital_name', 'slot_time', 'created_at'
        ]

    def get_slot_time(self, obj):
        # Time ko sundar format mein bhejne ke liye
        if obj.slot:
            return obj.slot.start_time.strftime("%I:%M %p")
        return "Not Scheduled"