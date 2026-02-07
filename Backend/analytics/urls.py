from django.urls import path
from .views import SuperAdminDashboardView

urlpatterns = [
    path('super-admin/stats/', SuperAdminDashboardView.as_view(), name='super-admin-stats'),
]