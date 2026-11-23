import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import LandingMapPreview from './LandingMapPreview';

const VOLS_RECENTS = [
  { code: 'MD-501', statut: 'En vol', alt: '8 200 ft' },
  { code: '5R-MFE', statut: 'Au sol', alt: '—' },
  { code: 'MD-307', statut: 'En vol', alt: '12 500 ft' },
];

export default function MapPreviewSection() {
  const navigate = useNavigate();

  return (
    <section id="carte" className="py-24 bg-[#070f1f] relative overflow-hidden">
      {/* Halo lumineux en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#059669]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-[#059669]/10 text-[#059669] text-sm font-semibold rounded-full mb-4 border border-[#059669]/20">
            Carte interactive
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Visualisez Madagascar depuis les airs
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Naviguez sur notre carte géospatiale et découvrez l'intégralité du réseau aéronautique
            de la Grande Île en temps réel.
          </p>
        </div>

        {/* Aperçu de la carte */}
        <div className="relative rounded-3xl overflow-hidden border border-[#0f172a] shadow-2xl shadow-black/50 bg-[#0a1428]">
          {/* Barre supérieure style navigateur */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1b3e] border-b border-[#0f172a]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4 bg-[#0f172a] rounded-lg px-4 py-1.5 text-gray-400 text-xs font-mono text-center">
              aviamada.mg/carte — espace aérien Madagascar
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#059669]/20 text-[#059669] rounded text-xs font-semibold">
                Live
              </button>
              <button className="px-3 py-1 bg-[#0f172a] text-gray-400 rounded text-xs">Filtres</button>
            </div>
          </div>

          {/* Canvas de la carte */}
          <div className="relative h-80 sm:h-96 lg:h-[500px] bg-[#091020]">
            <LandingMapPreview />

            {/* Carte flottante de trafic en direct */}
            <div className="absolute top-4 right-4 bg-[#0d1b3e]/90 backdrop-blur-sm border border-[#0f172a] rounded-xl p-4 text-xs text-white space-y-2 w-48">
              <div className="font-bold text-[#059669] text-sm mb-2">Trafic en temps réel</div>
              {VOLS_RECENTS.map((appareil) => (
                <div key={appareil.code} className="flex justify-between items-center">
                  <span className="font-mono text-blue-300">{appareil.code}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      appareil.statut === 'En vol'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {appareil.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#059669] hover:bg-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:-translate-y-1 hover:shadow-xl"
          >
            <MapPin className="w-5 h-5" />
            Accéder à la carte
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
