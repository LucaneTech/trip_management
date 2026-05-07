from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_ADMIN = 'admin'
    ROLE_AGENT = 'agent'
    ROLE_CLIENT = 'client'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_AGENT, 'Agent'),
        (ROLE_CLIENT, 'Client'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CLIENT)
    phone = models.CharField(max_length=32, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    def is_agent(self):
        return self.role == self.ROLE_AGENT

    def is_client(self):
        return self.role == self.ROLE_CLIENT
