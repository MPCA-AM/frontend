import { useState } from 'react';
import { Building2, FileUp, Plane } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ShapefileUploadCard } from '@/components/geoserver/ShapefileUploadCard';
import AerodromeForm from '@/components/editor/AerodromeForm';
import AeronefForm from '@/components/editor/AeronefForm';

export default function EditeurPage() {
  const [onglet, setOnglet] = useState<'aerodrome' | 'aeronef' | 'shapefile'>('aerodrome');

  return (
    <DashboardLayout
      title="Espace Éditeur Cartographique"
      subtitle="Saisie et mise à jour des données géographiques, des infrastructures et des appareils"
    >
      <div className="max-w-4xl space-y-6">
        {/* Navigation des onglets */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <Button
            variant="ghost"
            onClick={() => setOnglet('aerodrome')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 rounded-none transition-all ${
              onglet === 'aerodrome'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" /> Ajouter / Modifier un Aérodrome
          </Button>

          <Button
            variant="ghost"
            onClick={() => setOnglet('aeronef')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 rounded-none transition-all ${
              onglet === 'aeronef'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Plane className="h-4 w-4" /> Enregistrer un Aéronef
          </Button>

          <Button
            variant="ghost"
            onClick={() => setOnglet('shapefile')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 rounded-none transition-all ${
              onglet === 'shapefile'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileUp className="h-4 w-4" /> Importer un Shapefile
          </Button>
        </div>

        {/* Contenu selon l'onglet actif */}
        {onglet === 'shapefile' && <ShapefileUploadCard />}
        {onglet === 'aerodrome' && <AerodromeForm />}
        {onglet === 'aeronef' && <AeronefForm />}
      </div>
    </DashboardLayout>
  );
}
