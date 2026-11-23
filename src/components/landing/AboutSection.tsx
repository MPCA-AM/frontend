export default function AboutSection() {
  return (
    <section id="apropos" className="py-24 bg-white dark:bg-[#0a1428]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texte de présentation */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-[#059669]/10 text-[#059669] text-sm font-semibold rounded-full mb-6 border border-[#059669]/20">
              À propos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white mb-6 leading-tight">
              L'aviation à Madagascar — Histoire et ambition
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Madagascar dispose d'un réseau aéronautique unique en Afrique, avec plus de{' '}
                <strong className="text-[#0f172a] dark:text-white">50 aérodromes</strong> répartis sur
                les 22 régions de la Grande Île. La{' '}
                <strong className="text-[#059669]">
                  Direction Générale de l'Aviation Civile (DGAC Madagascar)
                </strong>{' '}
                supervise l'ensemble des opérations aériennes nationales.
              </p>
              <p>
                Fondé en 1962, le secteur de l'aviation civile malgache a connu une transformation
                majeure avec la modernisation de l'Aéroport International d'Ivato à Antananarivo,
                hub principal des vols internationaux.
              </p>
              <p>
                Ce portail cartographique a été développé pour centraliser et moderniser la gestion
                des données aéronautiques nationales, conformément aux standards{' '}
                <strong className="text-[#0f172a] dark:text-white">OACI</strong> et aux exigences de
                sécurité internationales.
              </p>
            </div>

            {/* Citation de mission */}
            <div className="mt-8 p-6 bg-[#0f172a]/5 dark:bg-[#0f172a]/40 rounded-2xl border-l-4 border-[#059669]">
              <p className="text-[#0f172a] dark:text-white font-semibold italic text-lg leading-relaxed">
                "Notre mission : offrir une plateforme fiable, moderne et accessible pour garantir
                la sécurité et l'efficacité de l'espace aérien malgache."
              </p>
              <p className="text-[#059669] text-sm font-bold mt-3">— DGAC Madagascar</p>
            </div>
          </div>

          {/* Image illustrative */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-[#059669]/10 rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
              alt="Aéroport d'Antananarivo"
              className="relative z-10 w-full h-80 sm:h-96 object-cover rounded-2xl shadow-2xl"
              loading="lazy"
            />
            <div className="absolute z-20 -bottom-4 -right-4 bg-[#0f172a] text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl font-extrabold text-[#059669]">1962</div>
              <div className="text-xs text-gray-300 mt-0.5">Fondation de la DGAC</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
