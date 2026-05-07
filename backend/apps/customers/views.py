from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import CustomerListSerializer, CustomerProfileSerializer
from .models import CustomerProfile

User = get_user_model()


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role='client')
    serializer_class = CustomerListSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.select_related('user').all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()
