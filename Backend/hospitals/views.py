from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from appointments.models import Appointment
from .models import Doctor, Prescription, Slot
from datetime import datetime
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework import generics
from .models import Hospital, Doctor
from .serializers import HospitalSerializer, DoctorSerializer, SlotSerializer
from math import radians, cos, sin, asin, sqrt
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Hospital
from .serializers import HospitalSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

class IsHospitalAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'hospital_admin'
        )

class HospitalCreateView(generics.CreateAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

class HospitalListView(generics.ListAPIView):
    queryset = Hospital.objects.filter(verified=True)
    serializer_class = HospitalSerializer

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        hospital_id = self.kwargs['hospital_id']
        return Doctor.objects.filter(hospital_id=hospital_id)

class IsHospitalAdmin(permissions.BasePermission):
    """
    Only allow Hospital Admin to manage doctors of their hospital
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'hospital_admin'

class DoctorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Hospital Admins to manage their Doctors.
    Automatically creates a User account for each Doctor.
    """
    serializer_class = DoctorSerializer
    permission_classes = [IsHospitalAdmin]

    def get_queryset(self):
        # Filter doctors belonging to the logged-in Hospital Admin's hospital
        return Doctor.objects.filter(hospital__admin=self.request.user)

    def perform_create(self, serializer):
        # 1. Fetch the hospital managed by the current authenticated Hospital Admin
        hospital = Hospital.objects.get(admin=self.request.user)
        
        # 2. Generate a professional email based on the doctor's name
        doctor_name = serializer.validated_data['name']
        doc_username = doctor_name.replace(" ", "_").lower()
        
        # 3. Create a User instance so the Doctor can log in and get an Auth Token
        user = User.objects.create_user(
            username=doc_username,
            password="DoctorPassword123", # Set a default password for initial login
            user_type='doctor'            # Ensure 'doctor' is a valid choice in your User model
        )

        # 4. Save the Doctor profile and link it to the newly created User and Hospital
        serializer.save(hospital=hospital, user=user)

class ApproveHospitalView(generics.UpdateAPIView):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        hospital = self.get_object()
        hospital.verified = True
        hospital.save()

        
        admin = hospital.admin
        admin.is_active = True
        admin.save()

        return Response(
            {"status": "hospital approved & admin activated"},
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
def bulk_create_slots_view(request):
    from .utils import auto_generate_slots
    doctor_id = request.data.get('doctor_id')
    date = datetime.strptime(request.data.get('date'), '%Y-%m-%d').date()
    start = datetime.strptime(request.data.get('start_time'), '%H:%M').time()
    end = datetime.strptime(request.data.get('end_time'), '%H:%M').time()
    
    doctor = Doctor.objects.get(id=doctor_id)
    
    # Call the utility function
    count = auto_generate_slots(doctor, date, start, end)
    
    return Response({"message": f"Success! {count} slots created for Dr. {doctor.name}"})


class UploadPrescriptionView(APIView):
    """
    API for Doctors to upload prescriptions after a consultation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Debugging: Print request data to console
        print(f"DEBUG: Request Data -> {request.data}")
        
        # 2. Extract appointment ID (Key name 'appointment' from Postman)
        appointment_id = request.data.get('appointment')
        print(f"DEBUG: Appointment ID received -> {appointment_id}")

        try:
            # 3. Fetch the appointment instance
            appointment = Appointment.objects.get(id=appointment_id)
            
            # 4. Security Check: Only the assigned DOCTOR can upload this prescription
            # We compare the logged-in user with the user linked to the doctor profile
            if appointment.doctor.user != request.user:
                return Response({
                    "error": "Unauthorized. You are not the assigned doctor for this appointment."
                }, status=403)

            # 5. Create the Prescription record
            prescription = Prescription.objects.create(
                appointment=appointment,
                symptoms=request.data.get('symptoms'),
                diagnosis=request.data.get('diagnosis'),
                medicines=request.data.get('medicines'), # Stores the list of medicines
                report_file=request.FILES.get('report')   # Key name 'report' from Postman log
            )
            
            # 6. Mark the appointment as completed
            appointment.status = 'completed'
            appointment.save()

            return Response({
                "message": "Prescription uploaded successfully and visit marked as completed!"
            }, status=201)

        except Appointment.DoesNotExist:
            return Response({"error": "Appointment ID not found"}, status=404)
        except Exception as e:
            # Catch any other unexpected errors
            return Response({"error": str(e)}, status=400)

class PatientMedicalHistoryView(APIView):
    """
    Allows patients to view all their past prescriptions and reports.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Patient se judi saari completed prescriptions uthao
        history = Prescription.objects.filter(appointment__patient=user).order_by('-created_at')
        
        data = []
        for p in history:
            data.append({
                "date": p.created_at.date(),
                "doctor": p.appointment.doctor.name,
                "hospital": p.appointment.hospital.name,
                "symptoms": p.symptoms,
                "diagnosis": p.diagnosis,
                "medicines": p.medicines,
                "report_url": request.build_absolute_uri(p.report_file.url) if p.report_file else None
            })
            
        return Response(data, status=status.HTTP_200_OK)

class AvailableSlotsView(generics.ListAPIView):
    serializer_class = SlotSerializer

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        date = self.request.query_params.get('date')
        
        # Sirf wahi slots dikhao jo booked nahi hain
        queryset = Slot.objects.filter(is_booked=False)
        
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if date:
            queryset = queryset.filter(start_time__date=date)
            
        return queryset

class HospitalSearchView(APIView):
    """
    API View to search and list hospitals.
    Supports location-based filtering if coordinates are provided.
    """
    def get(self, request):
        # Extract latitude and longitude from query parameters
        # Using .get() prevents 400 errors if keys are missing
        lat = request.GET.get('lat')
        lng = request.GET.get('lng')

        # If coordinates are not provided, return all verified hospitals
        if not lat or not lng:
            # Filtering by verified=True to ensure quality data on dashboard
            hospitals = Hospital.objects.filter(verified=True)
        else:
            # Placeholder for Geospatial/Distance-based filtering logic
            # Currently returns all verified hospitals to prevent empty results
            hospitals = Hospital.objects.filter(verified=True)
            
        # Serialize the queryset into JSON format
        serializer = HospitalSerializer(hospitals, many=True)
        
        # Return the serialized data with a 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)