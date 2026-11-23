import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TYPES_APPAREILS = [
  { name: 'Commercial (ATR/B737)', value: 45, color: '#059669' },
  { name: 'Privé / Évac Sanitaire', value: 25, color: '#10b981' },
  { name: 'Cargo / Fret', value: 15, color: '#0f172a' },
  { name: 'Hélicoptères & Utilitaires', value: 15, color: '#3b82f6' },
];

export default function DashboardFleetChart() {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
          Flotte par Catégorie
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Répartition des appareils répertoriés
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex flex-col justify-between flex-1">
        <div className="h-52 w-full my-auto" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TYPES_APPAREILS}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {TYPES_APPAREILS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {TYPES_APPAREILS.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
