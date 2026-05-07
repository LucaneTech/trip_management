import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  children: React.ReactNode;
  allow: UserRole[];
  fallback?: string;
}

export function RoleRoute({ children, allow, fallback = '/dashboard' }: RoleRouteProps) {
  const { user } = useAuthStore();
  if (!user || !allow.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}
