from django.db import models
from django.utils import timezone


class Trip(models.Model):
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    capacity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='trips/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.destination}"
