import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, CalendarCheck, CreditCard,
  Users, LogOut, Plane, UserCog, Search, BookOpen, Wallet,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Avatar } from '../ui/Avatar';
import type { UserRole } from '../../types';

interface NavItem { to: string; icon: React.ReactNode; label: string }
interface NavGroup { label: string; items: NavItem[] }

// ── Navigation per role ───────────────────────────────────────────────────

const adminNav: NavGroup[] = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Tableau de bord' }],
  },
  {
    label: 'Gestion',
    items: [
      { to: '/trips',    icon: <MapPin className="h-4 w-4" />,       label: 'Voyages' },
      { to: '/bookings', icon: <CalendarCheck className="h-4 w-4" />, label: 'Réservations' },
      { to: '/payments', icon: <CreditCard className="h-4 w-4" />,    label: 'Paiements' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { to: '/customers', icon: <Users className="h-4 w-4" />,    label: 'Clients' },
      { to: '/users',     icon: <UserCog className="h-4 w-4" />,   label: 'Utilisateurs' },
    ],
  },
];

const agentNav: NavGroup[] = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Tableau de bord' }],
  },
  {
    label: 'CRM',
    items: [
      { to: '/customers', icon: <Users className="h-4 w-4" />,        label: 'Clients' },
      { to: '/bookings',  icon: <CalendarCheck className="h-4 w-4" />, label: 'Réservations' },
    ],
  },
];

const clientNav: NavGroup[] = [
  {
    label: 'Voyages',
    items: [
      { to: '/explore',      icon: <Search className="h-4 w-4" />,        label: 'Explorer' },
    ],
  },
  {
    label: 'Mon espace',
    items: [
      { to: '/my-bookings',  icon: <BookOpen className="h-4 w-4" />, label: 'Mes réservations' },
      { to: '/my-payments',  icon: <Wallet className="h-4 w-4" />,   label: 'Mes paiements' },
    ],
  },
];

// ── Sidebar bg per role ───────────────────────────────────────────────────
const sidebarBg: Record<UserRole, string> = {
  admin:  'bg-[#0D2144]',   // deep navy blue
  agent:  'bg-[#0A2418]',   // deep forest green
  client: 'bg-[#0F172A]',   // current ink dark
};

const roleBadge: Record<UserRole, string> = {
  admin:  'Administrateur',
  agent:  'Agent',
  client: 'Client',
};

// ── Sub-components ────────────────────────────────────────────────────────

function SidebarGroup({ label, items }: NavGroup) {
  return (
    <div className="mb-5">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role: UserRole = user?.role ?? 'client';

  const groups = role === 'admin' ? adminNav : role === 'agent' ? agentNav : clientNav;

  const displayName =
    user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '';

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/auth/login');
  };

  return (
    <aside className={cn('flex flex-col w-64 shrink-0 min-h-screen', sidebarBg[role])}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10">
          <Plane className="h-4 w-4 text-white" />
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-white tracking-tight">TripManager</span>
          <span className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">
            {roleBadge[role]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 overflow-y-auto">
        {groups.map((g) => (
          <SidebarGroup key={g.label} {...g} />
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded">
            <Avatar name={displayName || user.username} src={user.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName || user.username}</p>
              <p className="text-[10px] text-white/40 truncate">{roleBadge[role]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 h-7 w-7 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
