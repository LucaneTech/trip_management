from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'status', 'method', 'created_at')
    list_filter = ('status', 'method')
    search_fields = ('booking__id',)
