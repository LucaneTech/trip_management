from rest_framework import serializers
from django.db.models import Sum
from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ('id', 'title', 'destination', 'price', 'start_date', 'end_date', 'capacity', 'available_seats', 'description', 'image', 'waypoints', 'created_at')

    def get_available_seats(self, obj):
        from apps.bookings.models import Booking
        booked = (
            Booking.objects
            .filter(trip=obj)
            .exclude(status=Booking.STATUS_CANCELLED)
            .aggregate(total=Sum('seats'))['total'] or 0
        )
        return max(obj.capacity - booked, 0)
