from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'trip', 'seats', 'total_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('customer__username', 'trip__title')
