import { useAuthStore } from '../../store/authStore';
import { PageSpinner } from '../../components/ui/Spinner';
import { lazy, Suspense } from 'react';

const AdminDashboard  = lazy(() => import('./AdminDashboard'));
const AgentDashboard  = lazy(() => import('./AgentDashboard'));
const ClientDashboard = lazy(() => import('./ClientDashboard'));

export default function Overview() {
  const { user } = useAuthStore();

  if (!user) return <PageSpinner />;

  return (
    <Suspense fallback={<PageSpinner />}>
      {user.role === 'admin'  && <AdminDashboard />}
      {user.role === 'agent'  && <AgentDashboard />}
      {user.role === 'client' && <ClientDashboard />}
    </Suspense>
  );
}
