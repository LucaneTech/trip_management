import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { useCustomers } from '../../hooks/index';
import type { User } from '../../types';

function fullName(user: User): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return name || user.username;
}

export default function CustomerList() {
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase().trim();
  const filtered = (customers ?? []).filter((u: User) => {
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q)
    );
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Clients</h1>
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

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <Empty
            title="Aucun client trouvé"
            description={
              search
                ? 'Essayez un autre terme de recherche.'
                : 'Aucun client enregistré pour le moment.'
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user: User) => (
                <tr key={user.id}>
                  {/* Avatar + name */}
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={fullName(user)}
                        src={user.avatar}
                        size="md"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-ink">{fullName(user)}</span>
                        <span className="text-xs text-muted">@{user.username}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="text-sm text-muted">{user.email}</td>

                  {/* Phone */}
                  <td className="text-sm text-muted tabular-nums">
                    {user.phone ?? '—'}
                  </td>

                  {/* Role badge */}
                  <td>
                    <Badge value={user.role} />
                  </td>

                  {/* Actions */}
                  <td>
                    <Link
                      to={`/customers/${user.id}`}
                      className="text-sm font-medium text-ink hover:underline"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
