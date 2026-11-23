import { Link } from 'react-router-dom';
import { Plane, ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VOLS_RECENTS = [
  {
    id: '1',
    callsign: 'MD050',
    type: 'ATR 72-600',
    depart: 'FMMI (Antananarivo)',
    arrivee: 'FMNN (Nosy-Be)',
    statut: 'En vol',
    heure: '14:20',
    altitude: '18 500 ft',
  },
  {
    id: '2',
    callsign: 'MD112',
    type: 'Boeing 737-800',
    depart: 'FMMI (Antananarivo)',
    arrivee: 'FMMT (Toamasina)',
    statut: 'Atterri',
    heure: '13:45',
    altitude: 'Au sol',
  },
  {
    id: '3',
    callsign: 'AF934',
    type: 'Airbus A350-900',
    depart: 'LFPG (Paris CDG)',
    arrivee: 'FMMI (Antananarivo)',
    statut: 'En approche',
    heure: '15:10',
    altitude: '4 200 ft',
  },
  {
    id: '4',
    callsign: 'PRIV-5R',
    type: 'Cessna 208 Caravan',
    depart: 'FMSD (Fort-Dauphin)',
    arrivee: 'FMST (Toliara)',
    statut: 'En vol',
    heure: '14:05',
    altitude: '8 000 ft',
  },
  {
    id: '5',
    callsign: 'SAR-02',
    type: 'Eurocopter AS350',
    depart: 'FMMI (Base Ivato)',
    arrivee: 'FMSO (Morondava)',
    statut: 'Au sol',
    heure: '11:30',
    altitude: 'Au sol',
  },
];

export default function DashboardRecentFlights() {
  return (
    <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Derniers Mouvements Aériens
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Statut des vols en cours et récents
            </CardDescription>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-1"
          >
            Voir sur la carte <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 font-semibold rounded-l-lg">Appareil</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Trajet</th>
                <th className="p-3 font-semibold">Statut</th>
                <th className="p-3 font-semibold">Altitude</th>
                <th className="p-3 font-semibold rounded-r-lg">Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {VOLS_RECENTS.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plane className="h-3.5 w-3.5 text-emerald-500" />
                    {flight.callsign}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{flight.type}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {flight.depart} → {flight.arrivee}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={flight.statut === 'En vol' ? 'default' : 'secondary'}
                      className={`text-[10px] ${
                        flight.statut === 'En vol'
                          ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {flight.statut}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{flight.altitude}</td>
                  <td className="p-3 text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {flight.heure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
