import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, MapPin, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import type { UserRole } from '../../types';
import { Eye, EyeOff } from 'lucide-react';

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

const HERO_IMAGE = 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80';

const THUMB_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=200&q=70', label: 'Maroc' },
  { src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=200&q=70', label: 'Tokyo' },
  { src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=200&q=70', label: 'New York' },
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen flex">

      {/* ── Left panel — hero ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Maldives"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/80 via-ink/55 to-ink/30" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">TripManager</span>
          </div>

          {/* Tagline */}
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Votre prochaine aventure<br />
              <span className="text-accent">commence ici.</span>
            </h2>
            <p className="mt-4 text-white/70 max-w-xs">
              Rejoignez des milliers de voyageurs qui font confiance à TripManager pour organiser leurs escapades.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3">
              {['Réservations en quelques clics', 'Suivi en temps réel', 'Support 24h/24'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="h-5 w-5 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Thumbnail strip */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
              Destinations populaires
            </p>
            <div className="flex gap-3">
              {THUMB_IMAGES.map((t) => (
                <div key={t.label} className="relative rounded-xl overflow-hidden w-24 h-16 shrink-0">
                  <img src={t.src} alt={t.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-ink/30" />
                  <div className="absolute bottom-1 left-2 flex items-center gap-1 text-white text-xs font-medium">
                    <MapPin className="h-2.5 w-2.5" />
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-paper px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 bg-ink rounded-lg flex items-center justify-center shrink-0">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-ink tracking-tight">TripManager</span>
          </div>

          <h1 className="text-2xl font-bold text-ink mb-1">Créer un compte</h1>
          <p className="text-sm text-muted mb-8">Rejoignez TripManager dès maintenant</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            <div>
              <label htmlFor="username" className="field-label">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="field-input"
                placeholder="Votre identifiant"
                {...register('username')}
              />
              {errors.username && <p className="field-error">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="field-label">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder="vous@exemple.com"
                {...register('email')}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="field-label">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field-input pr-10"
                  placeholder="Min. 6 caractères"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="field-label">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field-input pr-10"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="field-label">
                Rôle <span className="normal-case font-normal">(optionnel)</span>
              </label>
              <select id="role" className="field-input" {...register('role')}>
                <option value="client">Client</option>
                <option value="agent">Agent</option>
                <option value="admin">Administrateur</option>
              </select>
              {errors.role && <p className="field-error">{errors.role.message}</p>}
            </div>

            {errors.root && <p className="field-error">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-ink text-white rounded-lg font-medium text-sm
                         hover:bg-ink/90 active:bg-ink/80 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Inscription…
                </>
              ) : (
                <>
                  S'inscrire
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Déjà un compte ?{' '}
            <Link to="/auth/login" className="text-accent font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
