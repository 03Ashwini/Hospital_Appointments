from datetime import datetime, timedelta
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from rest_framework import generics
from hospitals.serializers import SlotSerializer
from .tasks import send_appointment_sms 
from hospitals.views import IsHospitalAdmin
from .models import Appointment
from .serializers import AppointmentSerializer
from rest_framework.views import APIView
from django.conf import settings
import razorpay
import redis  
from hospitals.models import Prescription, Slot
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Slot
from rest_framework import status
import datetime
# Initialize Razorpay Client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# Redis connection (make sure redis-server is running)
r = redis.Redis(host='127.0.0.1', port=6379, db=0)

class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        slot_id = request.data.get('slot') # Frontend se slot ID aayegi
        user_id = request.user.id
        
       
        lock_key = f"slot_lock_{slot_id}"
        is_lock_acquired = r.set(lock_key, user_id, nx=True, ex=300) # nx=True means only set if not exists

        if not is_lock_acquired:
            return Response(
                {"error": "This slot is currently being held by another user for payment. Please try again in 5 minutes."},
                status=status.HTTP_409_CONFLICT
            )

        # --- 2. DATABASE ATOMIC CHECK ---
        try:
            with transaction.atomic():
                # select_for_update database level par row ko lock kar deta hai
                slot = Slot.objects.select_for_update().get(id=slot_id)
                
                if slot.is_booked:
                    return Response({"error": "Sorry, this slot is already fully booked."}, status=400)

                # Agar sab sahi hai, toh Serializer call karo
                response = super().create(request, *args, **kwargs)
                
              
                return response

        except Slot.DoesNotExist:
            return Response({"error": "Invalid Slot ID"}, status=404)
        except Exception as e:
            # Agar error aaye toh Redis lock manually delete kar sakte hain
            r.delete(lock_key)
            return Response({"error": str(e)}, status=500)

    # appointments/views.py
    def perform_create(self, serializer):
        # 1. Appointment save karo
        appointment = serializer.save(patient=self.request.user)
        
        # 2. Slot ko block karo taaki koi aur ise book na kar sake
        slot = appointment.slot
        if slot:
            slot.is_booked = True
            slot.save()
            
class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Appointment.objects.filter(patient=user, status='confirmed').order_by('-created_at')

class HospitalAppointmentsListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        # Only appointments for this hospital's doctors
        return Appointment.objects.filter(doctor__hospital__admin=self.request.user)

class AppointmentConfirmView(generics.UpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            # 1. Fetch the appointment
            appointment = Appointment.objects.get(id=pk)
            
            # 2. Status update
            appointment.status = 'confirmed'
            
            # 3. Token generate (jo humne naye logic mein banaya hai)
            token = appointment.generate_token() 
            
            appointment.save()
            
            # 4. SMS Task Fix: Yahan appointment.slot.start_time use karein
            if appointment.slot:
                slot_time_str = str(appointment.slot.start_time)
            else:
                slot_time_str = "Scheduled Time"

            send_appointment_sms.delay(
                patient_phone=appointment.patient.phone_number,
                doctor_name=appointment.doctor.name,
                slot_time=slot_time_str  
            )

            return Response({
                "status": "Appointment confirmed",
                "token_no": token,
                "message": "SMS notification queued"
            }, status=status.HTTP_200_OK)

        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=404)


class CancelAppointmentView(APIView):
    """
    Handles appointment cancellation, releases time slots, 
    and initiates Razorpay refunds by accessing the linked Payment model.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        user = request.user
        
        try:
            with transaction.atomic():
                # 1. Fetch appointment and lock the row
                # We use select_for_update to prevent other processes from changing this record
                appointment = Appointment.objects.select_for_update().get(
                    id=appointment_id, 
                    patient=user
                )

                # 2. Validation: Prevent cancellation if already completed or cancelled
                if appointment.status.lower() == 'completed':
                    return Response({"error": "Cannot cancel a completed appointment."}, status=status.HTTP_400_BAD_REQUEST)
                
                if appointment.status.lower() == 'cancelled':
                    return Response({"error": "Appointment is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

                # 3. Access Payment Info via OneToOne relationship (related_name='payment')
                payment_record = None
                try:
                    payment_record = appointment.payment # This looks into the Payment model
                except Exception:
                    print("⚠️ No payment record found linked to this appointment.")

                # 4. Trigger Razorpay Refund if payment exists
                if payment_record and payment_record.payment_id:
                    try:
                        refund_data = {
                            "payment_id": payment_record.payment_id,
                            "amount": int(payment_record.amount * 100), # Amount in paise
                            "speed": "normal",
                            "notes": {
                                "reason": f"Patient {user.username} cancelled appointment ID {appointment.id}"
                            }
                        }
                        # Initiate refund via Razorpay
                        client.refund.create(data=refund_data)
                        
                        # Update Payment status
                        payment_record.status = 'refunded'
                        payment_record.save()
                        print(f"✅ Refund initiated for Payment ID: {payment_record.payment_id}")
                        
                    except Exception as refund_err:
                        # Log refund error but continue with cancellation
                        print(f"⚠️ Razorpay Refund Failed: {str(refund_err)}")

                # 5. Release the doctor's time slot
                if appointment.slot:
                    slot = appointment.slot
                    slot.is_booked = False
                    slot.save()
                    print(f"✅ Slot {slot.id} is now available again.")

                # 6. Update appointment status to CANCELLED
                appointment.status = 'cancelled'
                appointment.save()

                return Response({
                    "message": "Appointment cancelled successfully. Refund processed.",
                    "status": "CANCELLED",
                    "refund_id": getattr(payment_record, 'payment_id', 'N/A')
                }, status=status.HTTP_200_OK)

        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found or you are not authorized."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Catch any other unexpected errors
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DoctorDelayNotificationView(APIView):
    """
    Hospital Admin can notify all patients if a doctor is late.
    """
    permission_classes = [IsHospitalAdmin]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        delay_minutes = request.data.get('delay_minutes')
        
        # Aaj ki saari active appointments uthao
        appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            status='confirmed',
            slot__start_time__date=timezone.now().date()
        )

        for appt in appointments:
            # Celery task to send SMS/Push Notification
            send_appointment_sms.delay(
                patient_phone=appt.patient.phone_number,
                doctor_name=appt.doctor.name,
                slot_time=f"LATE by {delay_minutes} mins"
            )

        return Response({"message": f"Notification sent to {appointments.count()} patients."}, status=200)

class GetAvailableSlotsView(APIView):
    def get(self, request):
        doctor_id = request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')
        
        try:
            # 1. Date parse (YYYY-MM-DD)
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # 2. Pehle check karo database mein Slots hain ya nahi
            slots = Slot.objects.filter(
                doctor_id=doctor_id,
                start_time__date=selected_date,
                is_booked=False
            )
            
            if not slots.exists():
                return Response({"message": "No slots available. Please create slots first."}, status=404)

            serializer = SlotSerializer(slots, many=True)
            return Response({
                "doctor_id": doctor_id,
                "date": date_str,
                "available_slots": serializer.data
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class SlotDetailView(APIView):
    def get(self, request, slot_id):
        try:
            # Model field 'start_time' use kar rahe hain
            slot = Slot.objects.get(id=slot_id)
            return Response({
                "id": slot.id,
                "doctor_name": slot.doctor.name,
                "doctor": slot.doctor.id,
                "hospital": slot.doctor.hospital.id,
                "date": slot.start_time.strftime('%d %b %Y'), # Extract Date
                "start_time": slot.start_time.strftime('%I:%M %p'), # Extract Time
                "consultation_fee": slot.doctor.consultation_fee
            })
        except Slot.DoesNotExist:
            return Response({"error": "Slot not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)