import { MapPin, Plane, Building2, Cloud, BarChart3, Shield, ChevronRight } from 'lucide-react';

const FONCTIONNALITES = [
  {
    icon: <MapPin className="w-8 h-8" />,
    titre: 'Carte interactive en temps réel',
    description:
      'Visualisez tous les aérodromes et aéronefs sur une carte dynamique de Madagascar, mise à jour en continu.',
  },
  {
    icon: <Plane className="w-8 h-8" />,
    titre: 'Suivi des aéronefs',
    description:
      'Suivez les trajectoires, positions et statuts de tous les aéronefs immatriculés à Madagascar en temps réel.',
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    titre: 'Gestion des aérodromes',
    description:
      'Accédez aux fiches complètes de chaque aérodrome : pistes, équipements, services et informations réglementaires.',
  },
  {
    icon: <Cloud className="w-8 h-8" />,
    titre: 'Données météo intégrées',
    description:
      "Consultez les conditions météorologiques actuelles et les prévisions pour chaque point de l'espace aérien malgache.",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    titre: 'Rapports et statistiques',
    description:
      "Générez des rapports détaillés sur le trafic aérien, les incidents et les performances de l'aviation nationale.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    titre: 'Sécurité et conformité',
    description:
      'Assurez la conformité avec les normes OACI et les réglementations de la DGAC Madagascar à chaque étape.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-24 bg-gray-50 dark:bg-[#0a1428]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#059669]/10 text-[#059669] text-sm font-semibold rounded-full mb-4 border border-[#059669]/20">
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-white mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Un portail complet pour la gestion de l'espace aérien malgache, conçu pour les
            professionnels de l'aviation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FONCTIONNALITES.map((item, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-[#0d1b3e] rounded-2xl p-8 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_8px_40px_rgba(192,57,43,0.12)] border border-gray-100 dark:border-[#0f172a] hover:border-[#059669]/30 dark:hover:border-[#059669]/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-[#059669]/10 rounded-xl flex items-center justify-center text-[#059669] mb-6 group-hover:bg-[#059669] group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-3">{item.titre}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
              <div className="mt-6 flex items-center text-[#059669] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                En savoir plus <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
