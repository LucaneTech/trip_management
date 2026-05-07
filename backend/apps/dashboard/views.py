from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from apps.trips.models import Trip
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.trips.serializers import TripSerializer
from apps.bookings.serializers import BookingSerializer

User = get_user_model()


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_trips = Trip.objects.count()
        total_bookings = Booking.objects.count()
        total_customers = User.objects.filter(role='client').count()
        revenue = Payment.objects.filter(status=Payment.STATUS_COMPLETED).aggregate(total=Sum('amount'))['total'] or 0

        popular_trips_qs = Trip.objects.annotate(bookings_count=Count('bookings')).order_by('-bookings_count')[:6]
        popular_trips = TripSerializer(popular_trips_qs, many=True, context={'request': request}).data

        recent_bookings_qs = Booking.objects.select_related('customer', 'trip').order_by('-created_at')[:8]
        recent_bookings = BookingSerializer(recent_bookings_qs, many=True, context={'request': request}).data

        data = {
            'total_trips': total_trips,
            'total_bookings': total_bookings,
            'total_customers': total_customers,
            'revenue': revenue,
            'popular_trips': popular_trips,
            'recent_bookings': recent_bookings,
        }
        return Response(data)
