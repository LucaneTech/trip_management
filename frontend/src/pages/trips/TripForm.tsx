import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { TripPayload } from '../../types';

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

export function TripForm({ initialData, onSubmit, loading }: TripFormProps) {
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
        label="Prix (€)"
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

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={loading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
