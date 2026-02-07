from django.shortcuts import render

# Create your views here.
# reviews/views.py
from rest_framework import generics

from hospitals.views import IsHospitalAdmin
from .models import Review
from .serializers import ReviewSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from reviews.models import Review
from reviews.serializers import ReviewSerializer

class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        hospital_id = self.kwargs['hospital_id']
        return Review.objects.filter(hospital_id=hospital_id)

class ApproveReviewView(generics.UpdateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsHospitalAdmin]
    queryset = Review.objects.all()

    def patch(self, request, *args, **kwargs):
        review = self.get_object()
        if review.hospital.admin != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        review.is_approved = True
        review.save()
        return Response({'status': 'approved'})