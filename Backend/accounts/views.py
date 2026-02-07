from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.views import APIView
from .serializers import (
    PatientRegisterSerializer,
    HospitalAdminRegisterSerializer,
    LoginSerializer
)

class PatientRegisterView(generics.CreateAPIView):
    serializer_class = PatientRegisterSerializer


class HospitalAdminRegisterView(generics.CreateAPIView):
    serializer_class = HospitalAdminRegisterSerializer




class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer se validated user object nikalo
            user = serializer.validated_data
            
            # Manual tokens generate karo
            refresh = RefreshToken.for_user(user)
            
            # Response mein tokens ke saath 'user_type' bhi bhejo
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': user.user_type,  # 👈 Ye line React ko role batayegi
                'username': user.username,
                'is_staff': user.is_staff
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)