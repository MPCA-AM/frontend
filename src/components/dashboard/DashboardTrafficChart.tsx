import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DONNEES_TRAFIC = [
  { jour: 'Lun', vols: 38, ponctuels: 35 },
  { jour: 'Mar', vols: 45, ponctuels: 42 },
  { jour: 'Mer', vols: 40, ponctuels: 38 },
  { jour: 'Jeu', vols: 52, ponctuels: 49 },
  { jour: 'Ven', vols: 65, ponctuels: 61 },
  { jour: 'Sam', vols: 58, ponctuels: 54 },
  { jour: 'Dim', vols: 48, ponctuels: 46 },
];

export default function DashboardTrafficChart() {
  return (
    <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Activité Aérienne Hebdomadaire
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Évolution des vols contrôlés sur Madagascar
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Semaine en cours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DONNEES_TRAFIC}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="jour" stroke="#888888" fontSize={12} tickLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="vols"
                name="Total vols"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ponctuels"
                name="À l'heure"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
