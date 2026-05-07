import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Plane, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

export default function ClientLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/auth/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-ink font-semibold text-sm transition-colors'
      : 'text-muted hover:text-ink text-sm transition-colors';

  const displayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username
    : '';

  return (
    <>
      {/* ── Top navigation bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 h-14 bg-surface border-b border-border flex items-center px-8 gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <Plane className="h-5 w-5 text-ink" strokeWidth={2} />
          <span className="font-bold text-ink text-sm tracking-tight">TripManager</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-6 flex-1">
          <NavLink to="/explore" className={navLinkClass}>
            Explorer
          </NavLink>
          <NavLink to="/my-bookings" className={navLinkClass}>
            Mes réservations
          </NavLink>
          <NavLink to="/my-payments" className={navLinkClass}>
            Mes paiements
          </NavLink>
        </div>

        {/* Right — user info + logout */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <>
              <Avatar name={displayName} src={user.avatar} size="sm" />
              <span className="text-sm font-medium text-ink hidden sm:block">
                {displayName}
              </span>
            </>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-muted hover:text-ink text-xs transition-colors ml-1"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="pt-14 min-h-screen bg-paper">
        <Outlet />
      </main>
    </>
  );
}
