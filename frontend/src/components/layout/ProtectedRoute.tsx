import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { PageSpinner } from '../ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user, setUser } = useAuthStore();
  const [checking, setChecking] = useState(!user && !!accessToken);

  useEffect(() => {
    if (!user && accessToken) {
      authService
        .me()
        .then(setUser)
        .catch(() => {})
        .finally(() => setChecking(false));
    }
  }, []);

  if (!accessToken) return <Navigate to="/auth/login" replace />;
  if (checking) return <PageSpinner />;
  return <>{children}</>;
}
