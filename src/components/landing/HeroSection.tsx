import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MapPin, ArrowRight } from 'lucide-react';

const STATS = [
  { valeur: '0', label: 'Aérodromes' },
  { valeur: '0', label: 'Aéronefs suivis' },
  { valeur: '22', label: 'Régions couvertes' },
  { valeur: '24/7', label: 'Surveillance' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [statsVisibles, setStatsVisibles] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 300) {
        setStatsVisibles(true);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allerVersCarte = () => {
    const el = document.querySelector('#carte');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Superposition sombre */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070f1f]/90 via-[#0f172a]/80 to-[#0d1b3e]/90" />

      {/* Silhouettes décoratives d'avions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <svg
            key={i}
            className="absolute opacity-5 text-white"
            style={{
              top: `${10 + i * 15}%`,
              left: `${-5 + i * 18}%`,
              transform: `rotate(${i * 30}deg) scale(${0.5 + i * 0.15})`,
            }}
            viewBox="0 0 100 100"
            width="120"
            height="120"
            fill="currentColor"
          >
            <path d="M50 5 L65 35 L95 40 L65 65 L72 95 L50 80 L28 95 L35 65 L5 40 L35 35 Z" />
          </svg>
        ))}
        <Plane className="landing-flight absolute left-0 top-[58%] h-14 w-14 text-emerald-300" aria-hidden="true" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-4xl">
          {/* Badge officiel */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669]/20 border border-[#059669]/40 rounded-full text-[#059669] text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
            DGAC Madagascar — Portail Officiel
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Portail{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-300">
              Cartographique
            </span>{' '}
            de l'Aviation à{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              Madagascar
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Plateforme de surveillance et de gestion de l'espace aérien malgache. Accédez à la carte
            interactive, suivez les aéronefs en temps réel et gérez les données aéronautiques nationales.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={allerVersCarte}
              className="group flex items-center gap-2 px-8 py-4 bg-[#059669] hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 hover:-translate-y-1"
            >
              <MapPin className="w-5 h-5" />
              Explorer la carte
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
            >
              <Plane className="w-5 h-5" />
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {/* Barre des statistiques */}
      <div className="relative z-10 border-t border-white/10 bg-[#0d1b3e]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  statsVisibles ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-[#059669]">{stat.valeur}</div>
                <div className="text-sm text-gray-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 text-xs">
        <span>Défiler</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
