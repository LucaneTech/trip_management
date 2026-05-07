from django.contrib import admin
from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'destination', 'price', 'start_date', 'end_date', 'capacity')
    search_fields = ('title', 'destination')
