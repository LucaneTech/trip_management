from django.db import models
from django.utils import timezone
import datetime


def _next_invoice_number():
    year = datetime.date.today().year
    last = Invoice.objects.filter(invoice_number__startswith=f'FAC-{year}-').order_by('-id').first()
    if last:
        try:
            seq = int(last.invoice_number.split('-')[-1]) + 1
        except ValueError:
            seq = 1
    else:
        seq = 1
    return f'FAC-{year}-{seq:04d}'


class Invoice(models.Model):
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='invoice',
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    generated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f'Facture {self.invoice_number}'

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = _next_invoice_number()
        if not self.total_amount:
            self.total_amount = self.booking.total_price
        super().save(*args, **kwargs)
