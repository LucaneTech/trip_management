from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomerProfile
from apps.authentication.serializers import UserSerializer

User = get_user_model()


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ('id', 'user', 'phone', 'address', 'preferences')


class CustomerListSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile')
