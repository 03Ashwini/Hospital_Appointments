# payments/views.py
import razorpay
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json
import hmac
import hashlib
import base64
from appointments.models import Appointment

from .models import Payment
from .serializers import PaymentSerializer
from .tasks import verify_payment_task

# Razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


# payments/views.py

class PaymentCreateView(generics.CreateAPIView):
    serializer_class = PaymentSerializer

    def post(self, request, *args, **kwargs):
        appointment_id = request.data.get('appointment')
        
        # 1. Check Appointment ID
        if not appointment_id:
            return Response({"error": "Appointment ID is required"}, status=400)

        try:
            # 2. Database se Appointment aur Doctor ki Fees fetch karo
            from appointments.models import Appointment
            appointment = Appointment.objects.select_related('doctor').get(id=appointment_id)
            
            # Security: Amount frontend se nahi, backend (Database) se uthao
            amount = appointment.doctor.consultation_fee 
            
            if not amount or amount <= 0:
                return Response({"error": "Invalid consultation fee for this doctor"}, status=400)

            amount_paise = int(float(amount) * 100) # Convert to paise

            # 3. Create Razorpay order
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": "1",
                "notes": {
                    "appointment_id": appointment.id,
                    "patient_name": appointment.patient.username
                }
            })

            # 4. Save Payment record
            payment = Payment.objects.create(
                appointment=appointment,
                order_id=razorpay_order['id'],
                amount=amount,
                status='pending'
            )

            return Response({
                "order_id": razorpay_order['id'],
                "amount": amount,
                "currency": "INR",
                "appointment_id": appointment.id
            }, status=status.HTTP_201_CREATED)

        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=404)
        except Exception as e:
            return Response({"error": f"Razorpay Error: {str(e)}"}, status=500)


# class RazorpayWebhookView(APIView):
#     """
#     Webhook endpoint for Razorpay to confirm payment
#     """
#     permission_classes = [AllowAny]

#     @csrf_exempt
#     def post(self, request):
#         # webhook_secret = settings.RAZORPAY_KEY_SECRET
#         received_data = request.body
#         signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE')

#         # Generate HMAC SHA256 signature
#         # generated_signature = hmac.new(
#         #     webhook_secret.encode(),
#         #     msg=received_data,
#         #     digestmod=hashlib.sha256
#         # ).digest()
#         # generated_signature = base64.b64encode(generated_signature).decode()

#         # if signature == generated_signature:
#             # Extract order & payment IDs
#             payload = json.loads(received_data)
#             order_id = payload['payload']['payment']['entity']['order_id']
#             payment_id = payload['payload']['payment']['entity']['id']

#             # Call Celery task to verify payment & confirm appointment
#             verify_payment_task.delay(payment_id, order_id)

#             return Response({"status": "success"}, status=200)
#         else:
#             return Response({"status": "invalid signature"}, status=400)


from django.db import transaction

class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request):
        payload = json.loads(request.body)

        print("🔥 WEBHOOK HIT")
        print(payload)

        if payload.get("event") == "payment.captured":
            payment_id = payload["payload"]["payment"]["entity"]["id"]
            order_id = payload["payload"]["payment"]["entity"]["order_id"]

            try:
                # 1. Koshish karo Redis ko task dene ki
                verify_payment_task.delay(payment_id, order_id)
                print("✅ Task Queued to Redis")
            except Exception as e:
                # 2. AGAR REDIS REFUSE KARE, toh bypass karo!
                print(f"⚠️ Redis Connection Refused: {e}. Running task synchronously...")
                verify_payment_task(payment_id, order_id) 

            return Response({"status": "success"}, status=200)

class VerifyPaymentView(APIView):
    """
    Frontend (React) se aane wale payment verification ko handle karta hai.
    """
    def post(self, request):
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')
        appointment_id = request.data.get('appointment_id')

        # 1. Signature check karne ke liye dictionary
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }

        try:
            # 2. Razorpay Signature Verification
            client.utility.verify_payment_signature(params_dict)

            # 3. Database mein payment aur appointment update karo
            with transaction.atomic(): # Data safety ke liye
                payment = Payment.objects.get(order_id=order_id)
                payment.status = 'completed'
                payment.razorpay_payment_id = payment_id
                payment.save()

                appointment = Appointment.objects.get(id=appointment_id)
                appointment.status = 'confirmed'
                
                # Token generate karo (Models mein jo function banaya tha)
                token_no = appointment.generate_token() 
                appointment.save()

            # 4. Celery Task: SMS/Email background mein bhejo
            verify_payment_task.delay(payment_id, order_id) 

            return Response({
                "status": "success",
                "message": "Payment verified and Token generated",
                "token_no": token_no
            }, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid payment signature"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)