import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, Plane, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide.';
    }
    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Connexion réussie ! Bienvenue.');
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'editeur') {
        navigate('/editeur');
      } else {
        navigate('/map');
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border py-2.5 text-sm outline-none transition focus:ring-2 dark:bg-gray-800 dark:text-white';
  const inputOk =
    'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-gray-700 dark:focus:border-emerald-500';
  const inputErr = 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {/* Fond d'image flou */}
      <img
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
      />
      {/* Overlay sombre */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(26,39,68,0.72)' }}
      />

      {/* Carte de connexion */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 sm:mx-0">

        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: '#1a2744' }}
          >
            <Plane className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Aviation Madagascar
          </span>
        </div>

        {/* Icône décorative */}
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'rgba(5,150,105,0.10)' }}
        >
          <Lock className="h-7 w-7" style={{ color: '#059669' }} />
        </div>

        <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Accédez à votre espace de gestion cartographique.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="votre@email.mg"
                className={`${inputBase} pl-10 pr-4 ${errors.email ? inputErr : inputOk}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 transition hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`${inputBase} pl-10 pr-10 ${errors.password ? inputErr : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Connexion en cours…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Séparateur + lien inscription */}
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 dark:text-emerald-400 transition hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Aviation Madagascar — Tous droits réservés
      </p>
    </div>
  );
}
