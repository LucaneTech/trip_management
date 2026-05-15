from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    trip_title = serializers.SerializerMethodField()
    trip_destination = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = (
            'id', 'invoice_number', 'total_amount', 'generated_at',
            'booking', 'booking_status', 'customer_name',
            'trip_title', 'trip_destination', 'seats',
        )
        read_only_fields = fields

    def get_customer_name(self, obj):
        u = obj.booking.customer
        return f'{u.first_name} {u.last_name}'.strip() or u.username

    def get_trip_title(self, obj):
        return obj.booking.trip.title

    def get_trip_destination(self, obj):
        return obj.booking.trip.destination

    def get_booking_status(self, obj):
        return obj.booking.status

    def get_seats(self, obj):
        return obj.booking.seats
