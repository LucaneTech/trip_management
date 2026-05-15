import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, MapPin, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type FormData = z.infer<typeof schema>;

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80';

const THUMB_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=200&q=70', label: 'Santorin' },
  { src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=200&q=70', label: 'Paris' },
  { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=70', label: 'Bali' },
];

export default function Login() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { tokens, user } = await authService.login(data);
      setTokens(tokens.access, tokens.refresh);
      setUser(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { detail?: string } };
      if (apiErr?.status === 401) {
        setError('root', { message: "Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe." });
      } else {
        const detail = apiErr?.data?.detail;
        setError('root', { message: detail ?? 'Une erreur est survenue. Veuillez réessayer.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — hero ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Paysage de montagne"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/75 via-ink/50 to-transparent" />

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
            <h2 className="text-4xl font-bold leading-tight">
              Explorez le monde,<br />
              <span className="text-accent">un voyage à la fois.</span>
            </h2>
            <p className="mt-4 text-white/70 text-lg max-w-sm">
              Gérez vos réservations et découvrez des destinations d'exception depuis un seul espace.
            </p>

            {/* Stats strip */}
            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-white/60 text-sm mt-0.5">Destinations</p>
              </div>
              <div>
                <p className="text-2xl font-bold">12k+</p>
                <p className="text-white/60 text-sm mt-0.5">Voyageurs</p>
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-white/60 text-sm mt-0.5">Satisfaction</p>
              </div>
            </div>
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

          <h1 className="text-2xl font-bold text-ink mb-1">Connexion</h1>
          <p className="text-sm text-muted mb-8">Accédez à votre espace de gestion</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

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

            <div>
              <label htmlFor="password" className="field-label">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field-input pr-10"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="field-error">{errors.root.message}</p>
            )}

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
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-accent font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
