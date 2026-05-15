from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bookings.models import Booking


@receiver(post_save, sender=Booking)
def create_invoice_on_booking(sender, instance, created, **kwargs):
    if not created:
        return
    from apps.invoices.models import Invoice
    if not hasattr(instance, 'invoice'):
        Invoice.objects.create(
            booking=instance,
            total_amount=instance.total_price,
        )
