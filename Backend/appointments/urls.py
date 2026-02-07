# appointments/urls.py
from django.urls import path
from .views import AppointmentConfirmView, AppointmentCreateView, AppointmentListView, DoctorDelayNotificationView, GetAvailableSlotsView, HospitalAppointmentsListView,CancelAppointmentView, SlotDetailView

urlpatterns = [
    # Book new appointment
    path('create/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('confirm/<int:pk>/',AppointmentConfirmView.as_view(),name='appontment-confirm'),
    # List appointments for logged-in patient
    path('my/', AppointmentListView.as_view(), name='appointment-list'),
   #hospital admin can see list of appointments
    path('hospital_appointements/', HospitalAppointmentsListView.as_view(), name='hospital-appointments'),
    path('cancel/<int:appointment_id>/',CancelAppointmentView.as_view(),name='cancel-appointment'),
    path('doctor-delay/', DoctorDelayNotificationView.as_view(), name='doctor-delay-notify'),
    path('slots/available/', GetAvailableSlotsView.as_view(), name='available-slots'),
    path('slots/details/<int:slot_id>/', SlotDetailView.as_view(), name='slot-details'),

    
]
