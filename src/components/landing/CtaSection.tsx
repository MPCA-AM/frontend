import { useNavigate } from 'react-router-dom';

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-[#0f172a] via-[#0d1b3e] to-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path d="M0 100 Q100 50 200 100 T400 100" stroke="white" strokeWidth="1" fill="none" />
          <path d="M0 120 Q100 70 200 120 T400 120" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <div className="relative max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Prêt à explorer l'espace aérien malgache ?
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          Rejoignez le portail officiel de la DGAC Madagascar dès aujourd'hui.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-[#059669] hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-emerald-900/30"
          >
            Créer un compte
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
          >
            Se connecter
          </button>
        </div>
      </div>
    </section>
  );
}
