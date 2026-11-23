import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Plane, CheckCircle2 } from 'lucide-react';
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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const strength = getStrength(password);

  useEffect(() => {
    if (!token) {
      toast.error('Jeton de réinitialisation manquant ou invalide.');
    }
  }, [token]);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!password) {
      newErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit comporter au moins 8 caractères.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Jeton invalide. Veuillez redemander un lien de réinitialisation.');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-gray-950 px-4">
      <img
        src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(26,39,68,0.78)' }}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 border border-slate-200/20">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2744] text-[#c0392b] shadow-md">
            <Plane className="h-6 w-6 rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1a2744] dark:text-white">AviaMada</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Portail Cartographique Aviation MG</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mot de passe réinitialisé !</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Votre mot de passe a été mis à jour. Redirection automatique vers la page de connexion...
            </p>
            <Link
              to="/login"
              className="inline-block rounded-xl bg-[#c0392b] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#a93226] transition-colors"
            >
              Se connecter maintenant
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nouveau mot de passe</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Saisissez votre nouveau mot de passe sécurisé.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className="h-full flex-1 transition-all duration-300"
                          style={{
                            backgroundColor: step <= strength.score ? strength.color : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-semibold text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Mettre à jour le mot de passe'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
