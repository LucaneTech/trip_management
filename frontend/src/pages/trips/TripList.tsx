import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import {
  useTrips,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
} from '../../hooks/index';
import { useAuthStore } from '../../store/authStore';
import { TripForm } from './TripForm';
import type { Trip, TripPayload } from '../../types';

// ── TripFormModal ─────────────────────────────────────────────────────────

interface TripFormModalProps {
  open: boolean;
  onClose: () => void;
  trip?: Trip;
}

function TripFormModal({ open, onClose, trip }: TripFormModalProps) {
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip(trip?.id ?? 0);

  const isEdit = !!trip;

  const handleSubmit = async (data: TripPayload) => {
    if (isEdit) {
      await updateTrip.mutateAsync(data);
    } else {
      await createTrip.mutateAsync(data);
    }
    onClose();
  };

  const loading = createTrip.isPending || updateTrip.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le voyage' : 'Nouveau voyage'}
      size="lg"
    >
      <TripForm
        initialData={
          trip
            ? {
                title: trip.title,
                destination: trip.destination,
                price: trip.price,
                start_date: trip.start_date,
                end_date: trip.end_date,
                capacity: trip.capacity,
                description: trip.description,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  );
}

// ── TripList page ─────────────────────────────────────────────────────────

export default function TripList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: trips, isLoading } = useTrips();
  const deleteTrip = useDeleteTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>(undefined);

  const canManage = user?.role === 'admin' || user?.role === 'agent';
  const canDelete = user?.role === 'admin';

  const filtered = (trips ?? []).filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingTrip(undefined);
    setModalOpen(true);
  };

  const openEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTrip(undefined);
  };

  const handleDelete = async (trip: Trip) => {
    const confirmed = window.confirm(
      `Supprimer le voyage "${trip.title}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;
    await deleteTrip.mutateAsync(trip.id);
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Voyages</h1>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher…"
            className="h-9 w-64 field-input text-sm"
          />
          {canManage && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={openCreate}
            >
              Nouveau voyage
            </Button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <Empty
            title="Aucun voyage trouvé"
            description={
              searchQuery
                ? 'Essayez un autre terme de recherche.'
                : 'Aucun voyage n\'a encore été créé.'
            }
            action={
              canManage ? (
                <Button variant="primary" onClick={openCreate}>
                  Créer un voyage
                </Button>
              ) : undefined
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Titre</th>
                <th>Prix</th>
                <th>Départ</th>
                <th>Retour</th>
                <th>Places dispo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trip) => {
                const seats = trip.available_seats ?? trip.capacity;
                const hasSeats = seats > 0;
                return (
                  <tr key={trip.id}>
                    {/* Destination */}
                    <td>
                      <span className="flex items-center gap-1.5 text-sm text-ink">
                        <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                        {trip.destination}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="font-medium text-ink">{trip.title}</td>

                    {/* Price */}
                    <td className="text-sm tabular-nums">
                      {formatCurrency(trip.price)}
                    </td>

                    {/* Start date */}
                    <td className="text-sm text-muted tabular-nums">
                      {formatDate(trip.start_date)}
                    </td>

                    {/* End date */}
                    <td className="text-sm text-muted tabular-nums">
                      {formatDate(trip.end_date)}
                    </td>

                    {/* Available seats */}
                    <td>
                      <span className="flex items-center gap-1.5 text-sm">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            hasSeats ? 'bg-status-confirmed' : 'bg-status-cancelled'
                          )}
                        />
                        {seats}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                          Voir
                        </Button>

                        {canManage && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => openEdit(trip)}
                          >
                            Éditer
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            loading={
                              deleteTrip.isPending &&
                              deleteTrip.variables === trip.id
                            }
                            onClick={() => handleDelete(trip)}
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <TripFormModal
        open={modalOpen}
        onClose={closeModal}
        trip={editingTrip}
      />
    </div>
  );
}
