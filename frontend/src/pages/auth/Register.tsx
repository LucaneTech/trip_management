import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { authService } from '../../services/authService';
import type { UserRole } from '../../types';

const schema = z
  .object({
    username: z.string().min(1, "Le nom d'utilisateur est requis"),
    email: z.string().min(1, "L'adresse e-mail est requise").email('E-mail invalide'),
    password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
    role: z.enum(['admin', 'agent', 'client']).default('client'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
      });
      navigate('/auth/login');
    } catch (err: unknown) {
      const apiError = err as { data?: Record<string, string[]> };
      const fields = apiError?.data;
      if (fields && typeof fields === 'object') {
        const fieldMap: Record<string, 'username' | 'email' | 'password' | 'root'> = {
          username: 'username',
          email: 'email',
          password: 'password',
        };
        let hasFieldError = false;
        for (const [key, msgs] of Object.entries(fields)) {
          const formField = fieldMap[key];
          const message = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
          if (formField) {
            setError(formField, { message });
            hasFieldError = true;
          }
        }
        if (!hasFieldError) {
          const detail = fields['detail'] ?? fields['non_field_errors'];
          const message = Array.isArray(detail) ? detail.join(' ') : String(detail ?? "L'inscription a échoué.");
          setError('root', { message });
        }
      } else {
        setError('root', { message: "L'inscription a échoué. Veuillez réessayer." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="card max-w-sm w-full rounded-xl p-8">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 bg-ink rounded-lg flex items-center justify-center shrink-0">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-ink tracking-tight">TripManager</span>
        </div>

        <h1 className="text-xl font-bold text-ink mb-1">Créer un compte</h1>
        <p className="text-sm text-muted mb-6">Rejoignez TripManager dès maintenant</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Username */}
          <div>
            <label htmlFor="username" className="field-label">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="field-input"
              placeholder="Votre identifiant"
              {...register('username')}
            />
            {errors.username && (
              <p className="field-error">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="field-label">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field-input"
              placeholder="vous@exemple.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="field-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="field-input"
              placeholder="Min. 6 caractères"
              {...register('password')}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="field-label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="field-input"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="field-label">
              Rôle <span className="normal-case font-normal">(optionnel)</span>
            </label>
            <select
              id="role"
              className="field-input"
              {...register('role')}
            >
              <option value="client">Client</option>
              <option value="agent">Agent</option>
              <option value="admin">Administrateur</option>
            </select>
            {errors.role && (
              <p className="field-error">{errors.role.message}</p>
            )}
          </div>

          {/* Root / server error */}
          {errors.root && (
            <p className="field-error">{errors.root.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-ink text-white rounded font-medium text-sm
                       hover:bg-ink/90 active:bg-ink/80 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isSubmitting ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{' '}
          <Link to="/auth/login" className="text-ink font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
