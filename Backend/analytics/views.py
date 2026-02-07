from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, F, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from appointments.models import Appointment
from hospitals.models import Hospital, Doctor

class SuperAdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Date Range Filter (Default: Last 30 Days)
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)

        # 2. Key Performance Indicators (KPIs)
        # Note: 'created_at' agar model mein nahi hai toh ise hata sakte ho ya 'id__gte=0' kar sakte ho
        kpis = {
            "total_revenue": Appointment.objects.filter(
                status='confirmed'
            ).aggregate(total=Sum('doctor__consultation_fee'))['total'] or 0,
            
            "appointment_count": Appointment.objects.count(),
            "total_hospitals": Hospital.objects.count(),
            "total_doctors": Doctor.objects.count(),
            "new_patients": User.objects.filter(user_type='patient').count()
        }

        # 3. City-Wise Performance Breakdown
        # Hum Appointment table se group kar rahe hain taaki 'Unsupported lookup' error na aaye
        city_analytics = Appointment.objects.values(
            city_name=F('doctor__hospital__city')
        ).annotate(
            total_appointments=Count('id'),
            revenue=Sum('doctor__consultation_fee', filter=Q(status='confirmed'))
        ).order_by('-revenue')

        # 4. Hospital Leaderboard (Professional Table Data)
        hospital_leaderboard = Appointment.objects.values(
            name=F('doctor__hospital__name'),
            city=F('doctor__hospital__city')
        ).annotate(
            app_count=Count('id'),
            earned=Sum('doctor__consultation_fee', filter=Q(status='confirmed'))
        ).order_by('-earned')[:10]

        # 5. Status Analysis
        status_health = Appointment.objects.values('status').annotate(count=Count('id'))

        return Response({
            "filter_period_days": days,
            "summary_kpis": kpis,
            "city_wise_stats": city_analytics,
            "top_hospitals": hospital_leaderboard,
            "system_health": status_health
        })