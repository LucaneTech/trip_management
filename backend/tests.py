"""
Tests complets pour TripManager — authentication, trips, bookings, payments,
customers, dashboard.
"""

from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.trips.models import Trip
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.customers.models import CustomerProfile

User = get_user_model()


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_user(username='user', password='pass1234!', role='client', **kw):
    return User.objects.create_user(username=username, password=password, role=role, **kw)


def make_trip(**kw):
    defaults = dict(
        title='Paris Express',
        destination='Paris',
        price=Decimal('500.00'),
        start_date='2026-06-01',
        end_date='2026-06-10',
        capacity=20,
    )
    defaults.update(kw)
    return Trip.objects.create(**defaults)


def make_booking(customer, trip, seats=2, status=Booking.STATUS_PENDING):
    return Booking.objects.create(
        customer=customer,
        trip=trip,
        seats=seats,
        total_price=trip.price * seats,
        status=status,
    )


def make_payment(booking, amount=None, method='card', status=Payment.STATUS_PENDING):
    return Payment.objects.create(
        booking=booking,
        amount=amount or booking.total_price,
        method=method,
        status=status,
    )


# ── Authentication ────────────────────────────────────────────────────────────

class AuthRegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/register/'

    def test_register_success(self):
        r = self.client.post(self.url, {
            'username': 'alice', 'email': 'alice@test.com',
            'password': 'secret123!', 'role': 'client',
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', r.data)
        self.assertIn('refresh', r.data)
        self.assertTrue(User.objects.filter(username='alice').exists())

    def test_register_duplicate_username(self):
        make_user('bob')
        r = self.client.post(self.url, {
            'username': 'bob', 'email': 'bob2@test.com', 'password': 'secret123!',
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        r = self.client.post(self.url, {'username': 'carl'})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class AuthTokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/auth/token/'
        self.user = make_user('agent1', 'mypassword!', role='agent')

    def test_login_success(self):
        r = self.client.post(self.url, {'username': 'agent1', 'password': 'mypassword!'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('access', r.data)
        self.assertIn('refresh', r.data)

    def test_login_wrong_password(self):
        r = self.client.post(self.url, {'username': 'agent1', 'password': 'wrong'})
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unknown_user(self):
        r = self.client.post(self.url, {'username': 'nobody', 'password': 'x'})
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthMeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('dave', 'pass1234!', role='admin')
        self.client.force_authenticate(user=self.user)

    def test_me_returns_user(self):
        r = self.client.get('/api/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['username'], 'dave')
        self.assertEqual(r.data['role'], 'admin')

    def test_me_unauthenticated(self):
        c = APIClient()
        r = c.get('/api/auth/me/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ── Trips ─────────────────────────────────────────────────────────────────────

class TripListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('agent2', role='agent')
        make_trip(title='Rome')
        make_trip(title='Tokyo')

    def test_list_unauthenticated(self):
        r = self.client.get('/api/trips/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 2)

    def test_list_authenticated(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.get('/api/trips/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class TripCRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agent = make_user('agent3', role='agent')
        self.client.force_authenticate(user=self.agent)
        self.trip = make_trip()

    def test_create_trip(self):
        r = self.client.post('/api/trips/', {
            'title': 'New York',
            'destination': 'USA',
            'price': '999.00',
            'start_date': '2026-07-01',
            'end_date': '2026-07-10',
            'capacity': 15,
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['title'], 'New York')

    def test_retrieve_trip(self):
        r = self.client.get(f'/api/trips/{self.trip.id}/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['destination'], 'Paris')

    def test_update_trip(self):
        r = self.client.patch(f'/api/trips/{self.trip.id}/', {'title': 'Paris Updated'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['title'], 'Paris Updated')

    def test_delete_trip(self):
        r = self.client.delete(f'/api/trips/{self.trip.id}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Trip.objects.filter(id=self.trip.id).exists())

    def test_retrieve_nonexistent(self):
        r = self.client.get('/api/trips/9999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


# ── Bookings ──────────────────────────────────────────────────────────────────

class BookingCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_user = make_user('client1', role='client')
        self.client.force_authenticate(user=self.client_user)
        self.trip = make_trip(price=Decimal('300.00'), capacity=10)

    def test_create_booking(self):
        r = self.client.post('/api/bookings/', {'trip': self.trip.id, 'seats': 2})
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['seats'], 2)
        self.assertEqual(Decimal(r.data['total_price']), Decimal('600.00'))
        self.assertEqual(r.data['status'], 'pending')

    def test_create_booking_customer_set_automatically(self):
        r = self.client.post('/api/bookings/', {'trip': self.trip.id, 'seats': 1})
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get(id=r.data['id'])
        self.assertEqual(booking.customer, self.client_user)

    def test_create_booking_exceeds_capacity(self):
        r = self.client.post('/api/bookings/', {'trip': self.trip.id, 'seats': 50})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_booking_cannot_set_status(self):
        r = self.client.post('/api/bookings/', {
            'trip': self.trip.id, 'seats': 1, 'status': 'confirmed',
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['status'], 'pending')

    def test_capacity_respected_across_bookings(self):
        trip = make_trip(capacity=3)
        make_booking(self.client_user, trip, seats=2)
        r = self.client.post('/api/bookings/', {'trip': trip.id, 'seats': 2})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class BookingStatusUpdateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agent = make_user('agent4', role='agent')
        self.client.force_authenticate(user=self.agent)
        self.client_user = make_user('client2', role='client')
        self.trip = make_trip()
        self.booking = make_booking(self.client_user, self.trip)

    def test_patch_status_to_confirmed(self):
        r = self.client.patch(f'/api/bookings/{self.booking.id}/', {'status': 'confirmed'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'confirmed')

    def test_patch_status_to_cancelled(self):
        r = self.client.patch(f'/api/bookings/{self.booking.id}/', {'status': 'cancelled'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'cancelled')

    def test_patch_status_does_not_touch_total_price(self):
        original_price = self.booking.total_price
        self.client.patch(f'/api/bookings/{self.booking.id}/', {'status': 'confirmed'})
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.total_price, original_price)

    def test_patch_invalid_status(self):
        r = self.client.patch(f'/api/bookings/{self.booking.id}/', {'status': 'invalid_value'})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_bookings(self):
        r = self.client.get('/api/bookings/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data), 1)

    def test_delete_booking(self):
        r = self.client.delete(f'/api/bookings/{self.booking.id}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)


# ── Payments ──────────────────────────────────────────────────────────────────

class PaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agent = make_user('agent5', role='agent')
        self.client.force_authenticate(user=self.agent)
        self.client_user = make_user('client3', role='client')
        self.trip = make_trip()
        self.booking = make_booking(self.client_user, self.trip, seats=1)

    def test_create_payment(self):
        r = self.client.post('/api/payments/', {
            'booking': self.booking.id,
            'amount': '500.00',
            'method': 'card',
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['status'], 'pending')
        self.assertEqual(r.data['method'], 'card')

    def test_list_payments(self):
        make_payment(self.booking)
        r = self.client.get('/api/payments/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data), 1)

    def test_patch_status_to_completed(self):
        payment = make_payment(self.booking)
        r = self.client.patch(f'/api/payments/{payment.id}/', {'status': 'completed'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.status, 'completed')

    def test_patch_status_to_failed(self):
        payment = make_payment(self.booking)
        r = self.client.patch(f'/api/payments/{payment.id}/', {'status': 'failed'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        payment.refresh_from_db()
        self.assertEqual(payment.status, 'failed')

    def test_patch_invalid_status(self):
        payment = make_payment(self.booking)
        r = self.client.patch(f'/api/payments/{payment.id}/', {'status': 'refunded'})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_payment_requires_auth(self):
        c = APIClient()
        r = c.get('/api/payments/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ── Customers ─────────────────────────────────────────────────────────────────

class CustomerTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agent = make_user('agent6', role='agent')
        self.client.force_authenticate(user=self.agent)
        make_user('client_a', role='client', email='a@test.com')
        make_user('client_b', role='client', email='b@test.com')
        make_user('another_agent', role='agent', email='ag@test.com')

    def test_list_returns_only_clients(self):
        r = self.client.get('/api/customers/list/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        roles = {u['role'] for u in r.data}
        self.assertEqual(roles, {'client'})

    def test_list_requires_auth(self):
        c = APIClient()
        r = c.get('/api/customers/list/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = make_user('admin1', role='admin')
        self.client.force_authenticate(user=self.admin)

        client_user = make_user('client4', role='client')
        trip = make_trip()
        booking = make_booking(client_user, trip)
        make_payment(booking, status=Payment.STATUS_COMPLETED)

    def test_dashboard_returns_stats(self):
        r = self.client.get('/api/dashboard/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        for key in ('total_trips', 'total_bookings', 'total_customers', 'revenue'):
            self.assertIn(key, r.data)

    def test_dashboard_counts_correct(self):
        r = self.client.get('/api/dashboard/')
        self.assertEqual(r.data['total_trips'], 1)
        self.assertEqual(r.data['total_bookings'], 1)
        self.assertEqual(r.data['total_customers'], 1)
        self.assertGreater(float(r.data['revenue']), 0)

    def test_dashboard_requires_auth(self):
        c = APIClient()
        r = c.get('/api/dashboard/')
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_popular_trips_and_recent_bookings(self):
        r = self.client.get('/api/dashboard/')
        self.assertIn('popular_trips', r.data)
        self.assertIn('recent_bookings', r.data)
        self.assertIsInstance(r.data['popular_trips'], list)
        self.assertIsInstance(r.data['recent_bookings'], list)


# ── Invoices ──────────────────────────────────────────────────────────────────

class InvoiceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.agent = make_user('agent_inv', role='agent')
        self.client_user = make_user('client_inv', role='client')
        self.trip = make_trip(price=Decimal('400.00'))
        self.booking = make_booking(self.client_user, self.trip, seats=2)

    def test_invoice_auto_created_on_booking(self):
        from apps.invoices.models import Invoice
        self.assertTrue(Invoice.objects.filter(booking=self.booking).exists())

    def test_invoice_number_format(self):
        from apps.invoices.models import Invoice
        inv = Invoice.objects.get(booking=self.booking)
        self.assertTrue(inv.invoice_number.startswith('FAC-'))

    def test_invoice_total_matches_booking(self):
        from apps.invoices.models import Invoice
        inv = Invoice.objects.get(booking=self.booking)
        self.assertEqual(inv.total_amount, self.booking.total_price)

    def test_agent_can_list_all_invoices(self):
        self.client.force_authenticate(user=self.agent)
        r = self.client.get('/api/invoices/')
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.data), 1)

    def test_client_sees_only_own_invoices(self):
        other_client = make_user('other_client', role='client')
        other_booking = make_booking(other_client, self.trip, seats=1)
        self.client.force_authenticate(user=self.client_user)
        r = self.client.get('/api/invoices/')
        self.assertEqual(r.status_code, 200)
        invoice_ids = [inv['booking'] for inv in r.data]
        self.assertIn(self.booking.id, invoice_ids)
        self.assertNotIn(other_booking.id, invoice_ids)

    def test_invoice_pdf_download(self):
        from apps.invoices.models import Invoice
        inv = Invoice.objects.get(booking=self.booking)
        self.client.force_authenticate(user=self.agent)
        r = self.client.get(f'/api/invoices/{inv.id}/pdf/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Content-Type'], 'application/pdf')
        self.assertIn('attachment', r['Content-Disposition'])

    def test_invoice_requires_auth(self):
        c = APIClient()
        r = c.get('/api/invoices/')
        self.assertEqual(r.status_code, 401)
