from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CustomerViewSet, CustomerProfileViewSet

router = DefaultRouter()
router.register('list', CustomerViewSet, basename='customer')
router.register('profiles', CustomerProfileViewSet, basename='customerprofile')

urlpatterns = [
    path('', include(router.urls)),
]
