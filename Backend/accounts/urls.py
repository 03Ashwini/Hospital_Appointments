from django.urls import path
from .views import (
    PatientRegisterView,
    HospitalAdminRegisterView,
    LoginView
)

urlpatterns = [
    path('register/patient/', PatientRegisterView.as_view()),
    path('register/hospital-admin/', HospitalAdminRegisterView.as_view()),
    path('login/', LoginView.as_view()),
]
