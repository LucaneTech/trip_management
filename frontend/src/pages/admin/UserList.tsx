import { useState } from 'react';
import { Search, UserCog } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Empty } from '../../components/ui/Empty';
import { PageSpinner } from '../../components/ui/Spinner';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/apiClient';
import { formatDate } from '../../lib/utils';
import type { User } from '../../types';

function fullName(u: User) {
  return `${u.first_name} ${u.last_name}`.trim() || u.username;
}

export default function UserList() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/api/auth/users/'),
  });

  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const filtered = (users ?? []).filter((u) =>
    !q ||
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.first_name.toLowerCase().includes(q) ||
    u.last_name.toLowerCase().includes(q)
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-100">
            <UserCog className="h-5 w-5 text-blue-600" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Utilisateurs</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 field-input pl-9 text-sm w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card border-l-4 border-blue-500" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <Empty title="Aucun utilisateur trouvé" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Bio</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName(u)} src={u.avatar} size="md" />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-ink">{fullName(u)}</span>
                        <span className="text-xs text-muted">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{u.email || '—'}</td>
                  <td className="text-sm text-muted tabular-nums">{u.phone ?? '—'}</td>
                  <td><Badge value={u.role} /></td>
                  <td className="text-sm text-muted max-w-xs truncate">{u.bio ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">{filtered.length} utilisateur(s) affiché(s)</p>
    </div>
  );
}
