import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/layout/RoleRoute';
import { PageSpinner } from './components/ui/Spinner';

// Auth
const Login    = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Shared (admin + agent)
const Overview      = lazy(() => import('./pages/dashboard/Overview'));
const TripList      = lazy(() => import('./pages/trips/TripList'));
const TripDetail    = lazy(() => import('./pages/trips/TripDetail'));
const BookingList   = lazy(() => import('./pages/bookings/BookingList'));
const BookingDetail = lazy(() => import('./pages/bookings/BookingDetail'));
const PaymentList   = lazy(() => import('./pages/payments/PaymentList'));
const CustomerList  = lazy(() => import('./pages/customers/CustomerList'));
const CustomerDetail = lazy(() => import('./pages/customers/CustomerDetail'));

// Admin only
const UserList = lazy(() => import('./pages/admin/UserList'));

// Client
const ClientLayout = lazy(() => import('./components/layout/ClientLayout'));
const TripSearch   = lazy(() => import('./pages/client/TripSearch'));
const MyBookings   = lazy(() => import('./pages/client/MyBookings'));
const MyPayments   = lazy(() => import('./pages/client/MyPayments'));

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* ── Auth ─────────────────────────────────────────── */}
        <Route path="/auth/login"    element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* ── Client routes (top-nav layout) ───────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allow={['client']} fallback="/dashboard">
                <ClientLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/explore"      element={<TripSearch />} />
          <Route path="/my-bookings"  element={<MyBookings />} />
          <Route path="/my-payments"  element={<MyPayments />} />
          <Route path="/trips/:id"    element={<TripDetail />} />
        </Route>

        {/* ── Admin + Agent routes (sidebar layout) ────────── */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allow={['admin', 'agent']} fallback="/explore">
                <AppLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"    element={<Overview />} />
          <Route path="/trips"        element={<TripList />} />
          <Route path="/trips/:id"    element={<TripDetail />} />
          <Route path="/bookings"     element={<BookingList />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/payments"     element={<PaymentList />} />
          <Route path="/customers"    element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* Admin only */}
          <Route
            path="/users"
            element={
              <RoleRoute allow={['admin']} fallback="/dashboard">
                <UserList />
              </RoleRoute>
            }
          />
        </Route>

        {/* ── Smart redirect ────────────────────────────────── */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </Suspense>
  );
}

function SmartRedirect() {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/auth/login" replace />;

  // Defer to ProtectedRoute which will resolve user role
  const role = (() => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role as string | undefined;
    } catch {
      return undefined;
    }
  })();

  if (role === 'client') return <Navigate to="/explore" replace />;
  return <Navigate to="/dashboard" replace />;
}
