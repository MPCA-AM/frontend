import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardMetricCards from '@/components/dashboard/DashboardMetricCards';
import DashboardTrafficChart from '@/components/dashboard/DashboardTrafficChart';
import DashboardFleetChart from '@/components/dashboard/DashboardFleetChart';
import DashboardRecentFlights from '@/components/dashboard/DashboardRecentFlights';
import DashboardSigCard from '@/components/dashboard/DashboardSigCard';

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Tableau de bord de l'Aviation"
      subtitle="Surveillance de l'espace aérien et des infrastructures de Madagascar"
    >
      <div className="space-y-6">
        {/* Cartes des indicateurs clés */}
        <DashboardMetricCards />

        {/* Graphiques d'activité et de flotte */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardTrafficChart />
          <DashboardFleetChart />
        </div>

        {/* Tableau des derniers vols et raccourci SIG */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardRecentFlights />
          <DashboardSigCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
