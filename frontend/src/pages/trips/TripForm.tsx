import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { TripPayload, Waypoint } from '../../types';

const tripSchema = z
  .object({
    title: z.string().min(1, 'Le titre est requis'),
    destination: z.string().min(1, 'La destination est requise'),
    price: z
      .string()
      .min(1, 'Le prix est requis')
      .regex(/^\d+(\.\d{1,2})?$/, 'Format invalide (ex : 299.99)'),
    start_date: z.string().min(1, 'La date de départ est requise'),
    end_date: z.string().min(1, 'La date de retour est requise'),
    capacity: z
      .number({ invalid_type_error: 'La capacité est requise' })
      .int()
      .min(1, 'La capacité doit être au moins 1'),
    description: z.string().optional(),
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
    message: 'La date de retour doit être après la date de départ',
    path: ['end_date'],
  });

type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  initialData?: Partial<TripPayload>;
  onSubmit: (data: TripPayload) => Promise<void>;
  loading?: boolean;
}

function WaypointEditor({
  waypoints,
  onChange,
}: {
  waypoints: Waypoint[];
  onChange: (wps: Waypoint[]) => void;
}) {
  const add = () => onChange([...waypoints, { name: '', lat: 0, lng: 0 }]);
  const remove = (i: number) => onChange(waypoints.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Waypoint, value: string) => {
    const updated = [...waypoints];
    updated[i] = {
      ...updated[i],
      [field]: field === 'name' ? value : parseFloat(value) || 0,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="field-label flex items-center gap-1.5 mb-0">
          <MapPin className="h-3.5 w-3.5" /> Étapes du parcours
        </label>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 border border-sky-200 hover:border-sky-400 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter une étape
        </button>
      </div>

      {waypoints.length === 0 && (
        <p className="text-xs text-muted italic">
          Aucune étape définie — ajoutez au moins 2 points pour afficher le parcours sur la carte.
        </p>
      )}

      {waypoints.map((wp, i) => (
        <div key={i} className="flex items-center gap-2 flex-wrap">
          <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${
            i === 0 ? 'bg-green-600' : i === waypoints.length - 1 ? 'bg-red-600' : 'bg-sky-500'
          }`}>
            {i + 1}
          </span>
          <input
            value={wp.name}
            onChange={(e) => update(i, 'name', e.target.value)}
            placeholder="Ville (ex : Casablanca)"
            className="field-input flex-1 min-w-32 py-1.5 text-sm"
          />
          <input
            type="number"
            step="any"
            value={wp.lat || ''}
            onChange={(e) => update(i, 'lat', e.target.value)}
            placeholder="Latitude"
            className="field-input w-28 py-1.5 text-sm"
          />
          <input
            type="number"
            step="any"
            value={wp.lng || ''}
            onChange={(e) => update(i, 'lng', e.target.value)}
            placeholder="Longitude"
            className="field-input w-28 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {waypoints.length > 0 && (
        <p className="text-xs text-muted">
          Trouvez les coordonnées sur{' '}
          <a
            href="https://www.latlong.net/"
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 underline"
          >
            latlong.net
          </a>{' '}
          ou en faisant un clic droit sur Google Maps.
        </p>
      )}
    </div>
  );
}

export function TripForm({ initialData, onSubmit, loading }: TripFormProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(initialData?.waypoints ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      destination: initialData?.destination ?? '',
      price: initialData?.price ?? '',
      start_date: initialData?.start_date ?? '',
      end_date: initialData?.end_date ?? '',
      capacity: initialData?.capacity ?? ('' as unknown as number),
      description: initialData?.description ?? '',
    },
  });

  const handleFormSubmit = async (values: TripFormValues) => {
    await onSubmit({
      title: values.title,
      destination: values.destination,
      price: values.price,
      start_date: values.start_date,
      end_date: values.end_date,
      capacity: values.capacity,
      description: values.description,
      waypoints,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Titre"
          placeholder="Ex : Tour de Méditerranée"
          error={errors.title?.message}
          {...register('title')}
        />
        <Input
          label="Destination"
          placeholder="Ex : Barcelone, Espagne"
          error={errors.destination?.message}
          {...register('destination')}
        />
      </div>

      <Input
        label="Prix (MAD)"
        placeholder="Ex : 299.99"
        error={errors.price?.message}
        {...register('price')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date de départ"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="Date de retour"
          type="date"
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      </div>

      <Input
        label="Capacité"
        type="number"
        min={1}
        placeholder="Ex : 20"
        error={errors.capacity?.message}
        {...register('capacity', { valueAsNumber: true })}
      />

      <Textarea
        label="Description"
        placeholder="Décrivez ce voyage…"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="border-t border-border pt-4">
        <WaypointEditor waypoints={waypoints} onChange={setWaypoints} />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={loading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
