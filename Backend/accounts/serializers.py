from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# accounts/serializers.py
from rest_framework import serializers
from .models import User
from hospitals.models import Hospital  # Import the Hospital model to create a record during registration

class PatientRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'phone_number', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # 💡 Problem: create_user default mein phone_number nahi leta
        phone = validated_data.pop('phone_number', None)
        password = validated_data.pop('password')
        
        # User create karo basic fields ke saath
        user = User.objects.create_user(password=password, **validated_data)
        
        # Custom fields manually set karo
        user.phone_number = phone
        user.user_type = 'patient'
        user.save()
        return user

class HospitalAdminRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    hospital_name = serializers.CharField(write_only=True)
    hospital_city = serializers.CharField(write_only=True)
    hospital_address = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'email', 'username', 'phone_number', 'password', 'password2', 
            'hospital_name', 'hospital_city', 'hospital_address'
        )
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        # 1. Hospital data alag karo
        h_name = validated_data.pop('hospital_name')
        h_city = validated_data.pop('hospital_city')
        h_addr = validated_data.pop('hospital_address')
        validated_data.pop('password2')
        phone = validated_data.pop('phone_number', None)
        password = validated_data.pop('password')

        # 2. Base User create karo
        user = User.objects.create_user(password=password, **validated_data)

        # 3. Attributes manually set karo
        user.phone_number = phone
        user.user_type = 'hospital_admin'
        user.is_active = False # Admin approval pending
        user.save()

        # 4. Hospital link karo
        Hospital.objects.create(
            name=h_name,
            city=h_city,
            address=h_addr,
            admin=user
        )
        return user


from django.contrib.auth import authenticate
from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # 1. User ko authenticate karo
        user = authenticate(
            username=data['username'],
            password=data['password']
        )

        # 2. Check karo user valid hai ya nahi
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        
        if not user.is_active:
            raise serializers.ValidationError(
                "Account is not approved yet. Please wait for admin approval."
            )

        # 3. Yahan 'dict' return karne ke bajaye seedha 'user' object return karo
        # Isse views.py mein RefreshToken.for_user(user) sahi se chalega
        return user