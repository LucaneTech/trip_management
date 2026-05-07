from rest_framework import serializers
from django.db.models import Sum
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('id', 'customer', 'trip', 'seats', 'total_price', 'status', 'created_at')
        read_only_fields = ('id', 'customer', 'total_price', 'status', 'created_at')

    def validate(self, data):
        trip = data.get('trip')
        seats = data.get('seats', 1)
        booked = (
            Booking.objects
            .filter(trip=trip)
            .exclude(status=Booking.STATUS_CANCELLED)
            .aggregate(total=Sum('seats'))['total'] or 0
        )
        available = trip.capacity - booked
        if seats > available:
            raise serializers.ValidationError({'seats': f'Seulement {available} place(s) disponible(s).'})
        return data

    def create(self, validated_data):
        trip = validated_data['trip']
        seats = validated_data.get('seats', 1)
        validated_data['total_price'] = trip.price * seats
        return Booking.objects.create(**validated_data)
