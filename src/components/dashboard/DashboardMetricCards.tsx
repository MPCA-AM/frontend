import { Plane, Building2, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardMetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Carte 1 : Aéronefs */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aéronefs Suivis
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Plane className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">128</span>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> +12%
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">24 aéronefs actifs en vol actuellement</p>
        </CardContent>
      </Card>

      {/* Carte 2 : Aérodromes */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aérodromes Actifs
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">54</span>
            <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400">
              100% opérationnels
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">12 internationaux & nationaux, 42 secondaires</p>
        </CardContent>
      </Card>

      {/* Carte 3 : Mouvements */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mouvements du Jour
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">65</span>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> +8%
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">Mouvements IFR/VFR enregistrés</p>
        </CardContent>
      </Card>

      {/* Carte 4 : Alertes */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alertes & NOTAM
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">3</span>
            <Badge variant="outline" className="border-amber-500/30 text-amber-600 gap-1">
              <ArrowDownRight className="h-3.5 w-3.5" /> -2 résolues
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">2 NOTAM piste, 1 météo cyclonique</p>
        </CardContent>
      </Card>
    </div>
  );
}
