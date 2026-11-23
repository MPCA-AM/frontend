import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, Plane, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

function getStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score === 0) return { score: 0, label: '', color: '' };
  if (score === 1) return { score: 1, label: 'Très faible', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Faible', color: '#f97316' };
  if (score === 3) return { score: 3, label: 'Moyen', color: '#eab308' };
  return { score: 4, label: 'Fort', color: '#22c55e' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) newErrors.nom = 'Le nom complet est requis.';
    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Adresse e-mail invalide.';
    }
    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 caractères.';
    }
    if (!confirm) {
      newErrors.confirm = 'Veuillez confirmer le mot de passe.';
    } else if (confirm !== password) {
      newErrors.confirm = 'Les mots de passe ne correspondent pas.';
    }
    if (!acceptTerms) newErrors.terms = "Vous devez accepter les conditions d'utilisation.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, nom);
      toast.success('Compte créé avec succès ! Bienvenue.');
      navigate('/map');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de la création du compte.');
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
        src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=900&q=80"
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

      {/* Carte d'inscription — légèrement plus haute, scrollable sur mobile */}
      <div className="relative z-10 mx-4 my-6 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 sm:mx-0">

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
          style={{ background: 'rgba(26,39,68,0.10)' }}
        >
          <User className="h-7 w-7" style={{ color: '#1a2744' }} />
        </div>

        <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Inscription</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Créez votre compte pour accéder au portail cartographique.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="nom"
                type="text"
                autoComplete="name"
                value={nom}
                onChange={(e) => { setNom(e.target.value); clearError('nom'); }}
                placeholder="Jean Rakoto"
                className={`${inputBase} pl-10 pr-4 ${errors.nom ? inputErr : inputOk}`}
              />
            </div>
            {errors.nom && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nom}</p>}
          </div>

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
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                placeholder="votre@email.mg"
                className={`${inputBase} pl-10 pr-4 ${errors.email ? inputErr : inputOk}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                placeholder="••••••••"
                className={`${inputBase} pl-10 pr-10 ${errors.password ? inputErr : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}

            {/* Jauge de force */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{ background: strength.score >= s ? strength.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="mt-1 text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmer */}
          <div>
            <label
              htmlFor="confirm"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
                placeholder="••••••••"
                className={`${inputBase} pl-10 pr-10 ${errors.confirm ? inputErr : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirm}</p>}
          </div>

          {/* CGU */}
          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => { setAcceptTerms(e.target.checked); clearError('terms'); }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-emerald-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                J'accepte les{' '}
                <a href="#" className="font-medium underline" style={{ color: '#1a2744' }}>
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="font-medium underline" style={{ color: '#1a2744' }}>
                  politique de confidentialité
                </a>
                .
              </span>
            </label>
            {errors.terms && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.terms}</p>}
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
                Création en cours…
              </>
            ) : (
              'Créer un compte'
            )}
          </button>
        </form>

        {/* Lien vers login */}
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 dark:text-emerald-400 transition hover:underline"
            >
              Se connecter
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
