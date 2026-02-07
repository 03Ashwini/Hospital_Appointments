# hospitals/urls.py
from django.urls import path
from .views import ApproveHospitalView, AvailableSlotsView, HospitalCreateView, HospitalListView, DoctorListView, HospitalSearchView, PatientMedicalHistoryView, UploadPrescriptionView, bulk_create_slots_view
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet


urlpatterns = [
    path('create/', HospitalCreateView.as_view(), name='hospital-create'),
    path('', HospitalListView.as_view(), name='hospital-list'),
    path('<int:hospital_id>/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('<int:pk>/approve/', ApproveHospitalView.as_view(), name='approve-hospital'),
    path('medical-history/', PatientMedicalHistoryView.as_view(), name='medical-history'),
    path('upload-prescription/', UploadPrescriptionView.as_view(), name='upload-prescription'),
    path('slots/bulk-create/', bulk_create_slots_view, name='bulk-slot-create'),
    path('slots/available/', AvailableSlotsView.as_view(), name='available-slots'),
    path('search/', HospitalSearchView.as_view(), name='hospital-search'),
]

router = DefaultRouter()
router.register('doctors', DoctorViewSet, basename='doctor')

urlpatterns += router.urls
