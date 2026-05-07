import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

const routeLabels: Record<string, string> = {
  '/dashboard':   'Tableau de bord',
  '/trips':       'Voyages',
  '/bookings':    'Réservations',
  '/payments':    'Paiements',
  '/customers':   'Clients',
  '/users':       'Utilisateurs',
  '/explore':     'Explorer les voyages',
  '/my-bookings': 'Mes réservations',
  '/my-payments': 'Mes paiements',
  '/my-profile':  'Mon profil',
};

function getPageLabel(pathname: string) {
  const exact = routeLabels[pathname];
  if (exact) return exact;
  const prefix = Object.keys(routeLabels).find((k) => pathname.startsWith(k + '/'));
  return prefix ? routeLabels[prefix] : '';
}

const roleChip: Record<UserRole, { label: string; cls: string }> = {
  admin:  { label: 'Admin',  cls: 'bg-blue-100 text-blue-800' },
  agent:  { label: 'Agent',  cls: 'bg-emerald-100 text-emerald-800' },
  client: { label: 'Client', cls: 'bg-slate-100 text-slate-600' },
};

export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const label = getPageLabel(pathname);
  const role = user?.role ?? 'client';
  const chip = roleChip[role];

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-border bg-surface">
      <h1 className="text-sm font-semibold text-ink">{label}</h1>
      {user && (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${chip.cls}`}>
          {chip.label}
        </span>
      )}
    </header>
  );
}
