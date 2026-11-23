import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Plane, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setEmailError("L'adresse e-mail est requise.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Adresse e-mail invalide.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      <img
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(26,39,68,0.72)' }}
      />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900 sm:mx-0">
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

        {!sent ? (
          <>
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'rgba(192,57,43,0.10)' }}
            >
              <Mail className="h-7 w-7" style={{ color: '#c0392b' }} />
            </div>

            <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
              Mot de passe oublié
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre
              mot de passe.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                      if (emailError) setEmailError('');
                    }}
                    placeholder="votre@email.mg"
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 dark:bg-gray-800 dark:text-white ${
                      emailError
                        ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-gray-700 dark:focus:border-emerald-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{emailError}</p>
                )}
              </div>

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
                    Envoi en cours…
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <CheckCircle2 className="h-9 w-9 text-green-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              E-mail envoyé !
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Un lien de réinitialisation a été envoyé à{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>.
              Vérifiez votre boîte de réception (et vos spams).
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="mb-4 text-sm font-medium transition hover:underline"
              style={{ color: '#c0392b' }}
            >
              Renvoyer l'e-mail
            </button>
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Aviation Madagascar — Tous droits réservés
      </p>
    </div>
  );
}
