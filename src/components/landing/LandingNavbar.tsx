import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const LIENS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'À propos', href: '#apropos' },
  { label: 'Carte', href: '#carte' },
  { label: 'Contact', href: '#contact' },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [defilement, setDefilement] = useState(false);

  useEffect(() => {
    const gererScroll = () => {
      setDefilement(window.scrollY > 20);
    };
    window.addEventListener('scroll', gererScroll);
    return () => window.removeEventListener('scroll', gererScroll);
  }, []);

  const allerVers = (href: string) => {
    setMenuOuvert(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        defilement
          ? 'bg-white/90 dark:bg-[#0d1b3e]/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-[#0f172a]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-[#0f172a] rounded-lg group-hover:bg-[#059669] transition-colors duration-300">
              <Plane className="w-5 h-5 text-white rotate-45" />
            </div>
            <span className="text-xl font-bold text-[#0f172a] dark:text-white tracking-tight">
              Avia<span className="text-[#059669]">Mada</span>
            </span>
          </Link>

          {/* Liens de navigation bureau */}
          <div className="hidden md:flex items-center gap-6">
            {LIENS.map((item) => (
              <button
                key={item.label}
                onClick={() => allerVers(item.href)}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#059669] dark:hover:text-[#059669] transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#059669] group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Boutons d'action bureau */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-emerald-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#243660] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              S'inscrire
            </button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f172a] transition-colors"
            >
              {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu déroulant mobile */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOuvert ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-white dark:bg-[#0d1b3e] border-b border-gray-200 dark:border-[#0f172a]`}
      >
        <div className="px-4 py-4 space-y-3">
          {LIENS.map((item) => (
            <button
              key={item.label}
              onClick={() => allerVers(item.href)}
              className="block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#059669] py-1.5 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-2 text-sm font-semibold text-white bg-[#0f172a] hover:bg-[#243660] rounded-lg transition-colors"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
