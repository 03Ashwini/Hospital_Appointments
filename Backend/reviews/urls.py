# reviews/urls.py
from django.urls import path
from .views import ApproveReviewView, ReviewCreateView, ReviewListView

urlpatterns = [
    # Create review (only after completed appointment)
    path('create/', ReviewCreateView.as_view(), name='review-create'),

    # List reviews for a particular hospital
    path('hospital/<int:hospital_id>/', ReviewListView.as_view(), name='review-list'),
     path('<int:pk>/approve/', ApproveReviewView.as_view(), name='approve-review'),
]
