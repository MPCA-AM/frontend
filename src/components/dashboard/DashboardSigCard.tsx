import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DashboardSigCard() {
  return (
    <Card className="border-slate-800 bg-gradient-to-br from-[#0f172a] to-[#090d16] text-white p-6 shadow-md flex flex-col justify-between border">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white mb-4 shadow-lg shadow-emerald-950">
          <Compass className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold">Portail SIG Aviation</h3>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          Visualisez la cartographie interactive de Madagascar : 54 aérodromes, balises de navigation et aéronefs en direct avec rafraîchissement continu.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        <Link
          to="/map"
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950 transition-colors"
        >
          Ouvrir la Carte Interactive
        </Link>
        <Link
          to="/profil"
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          Paramètres de compte
        </Link>
      </div>
    </Card>
  );
}
