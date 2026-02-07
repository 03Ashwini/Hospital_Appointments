# payments/urls.py
from django.urls import path
from .views import PaymentCreateView, RazorpayWebhookView, VerifyPaymentView

urlpatterns = [
    # Create payment for an appointment
    path('create/', PaymentCreateView.as_view(), name='payment-create'),

    path('create/', PaymentCreateView.as_view(), name='payment-create'),
    path('webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
]
