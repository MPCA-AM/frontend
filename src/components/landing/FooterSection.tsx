import { Plane, ChevronRight } from 'lucide-react';
import { FaXTwitter, FaFacebookF, FaLinkedinIn, FaInstagram } from 'react-icons/fa6';

export default function FooterSection() {
  const allerVers = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const reseaux = [FaXTwitter, FaFacebookF, FaLinkedinIn, FaInstagram];

  return (
    <footer id="contact" className="bg-[#070f1f] border-t border-[#0f172a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Marque et description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-[#059669] rounded-lg">
                <Plane className="w-5 h-5 text-white rotate-45" />
              </div>
              <span className="text-xl font-bold text-white">
                Avia<span className="text-[#059669]">Mada</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              Portail cartographique officiel de l'aviation à Madagascar. Surveillance, gestion et
              visualisation de l'espace aérien malgache en temps réel.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              {reseaux.map((Icone, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-[#0f172a] hover:bg-[#059669] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icone className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', target: '#accueil' },
                { label: 'Fonctionnalités', target: '#fonctionnalites' },
                { label: 'À propos', target: '#apropos' },
                { label: 'Carte interactive', target: '#carte' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => allerVers(item.target)}
                    className="text-gray-400 hover:text-[#059669] text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Légal</h4>
            <ul className="space-y-3">
              {[
                'Politique de confidentialité',
                "Conditions générales d'utilisation",
                'Contact',
                'Support technique',
              ].map((item) => (
                <li key={item}>
                  <button className="text-gray-400 hover:text-[#059669] text-sm transition-colors duration-200 flex items-center gap-1 group text-left">
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform shrink-0" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ligne de copyright */}
        <div className="border-t border-[#0f172a] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center sm:text-left">
            © 2024 AviaMada — Portail Cartographique de l'Aviation à Madagascar. Tous droits réservés.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            <Plane className="w-3 h-3 text-[#059669]" />
            Développé pour la <span className="text-[#059669] font-semibold ml-1">DGAC Madagascar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
