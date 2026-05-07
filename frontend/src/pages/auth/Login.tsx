import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

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
        setError('root', { message: 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.' });
      } else {
        const detail = apiErr?.data?.detail;
        setError('root', { message: detail ?? 'Une erreur est survenue. Veuillez réessayer.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="card max-w-sm w-full rounded-xl p-8">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 bg-ink rounded-lg flex items-center justify-center shrink-0">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-ink tracking-tight">TripManager</span>
        </div>

        <h1 className="text-xl font-bold text-ink mb-1">Connexion</h1>
        <p className="text-sm text-muted mb-6">Accédez à votre espace de gestion</p>

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

          {/* Password */}
          <div>
            <label htmlFor="password" className="field-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
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
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-ink font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
