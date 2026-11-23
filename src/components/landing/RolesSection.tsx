import { Globe, Users, Lock, ChevronRight } from 'lucide-react';

const ROLES = [
  {
    icon: <Globe className="w-10 h-10" />,
    role: 'Client / Visiteur',
    description: "Accès public en lecture seule pour explorer l'espace aérien malgache.",
    avantages: [
      'Consulter la carte interactive',
      'Voir les aérodromes',
      'Données météo en temps réel',
      'Statistiques publiques',
    ],
    couleur: 'from-blue-500 to-blue-700',
  },
  {
    icon: <Users className="w-10 h-10" />,
    role: 'Éditeur',
    description: "Rôle dédié aux professionnels de l'aviation pour la saisie et la mise à jour des données.",
    avantages: [
      'Modifier les données existantes',
      'Ajouter des aéronefs',
      'Mettre à jour les fiches aérodromes',
      'Générer des rapports',
    ],
    couleur: 'from-[#059669] to-emerald-700',
  },
  {
    icon: <Lock className="w-10 h-10" />,
    role: 'Administrateur',
    description: 'Contrôle total du portail, des utilisateurs et des paramètres de sécurité.',
    avantages: [
      'Gestion complète des données',
      'Gestion des utilisateurs',
      'Accès aux statistiques avancées',
      'Configuration du système',
    ],
    couleur: 'from-[#0f172a] to-navy-900',
  },
];

export default function RolesSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#070f1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#059669]/10 text-[#059669] text-sm font-semibold rounded-full mb-4 border border-[#059669]/20">
            Profils utilisateurs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-white mb-4">
            Un accès adapté à chaque rôle
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            Le portail s'adapte à vos besoins selon votre niveau d'autorisation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROLES.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-[#0d1b3e] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(192,57,43,0.15)] border border-gray-100 dark:border-[#0f172a] hover:border-[#059669]/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${item.couleur}`} />

              <div className="p-8">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.couleur} flex items-center justify-center text-white mb-6 shadow-lg`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2">{item.role}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{item.description}</p>
                <ul className="space-y-2">
                  {item.avantages.map((avantage, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <ChevronRight className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                      {avantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
