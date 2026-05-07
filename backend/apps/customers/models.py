from django.db import models
from django.conf import settings


class CustomerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=40, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    preferences = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Profile {self.user.username}"
