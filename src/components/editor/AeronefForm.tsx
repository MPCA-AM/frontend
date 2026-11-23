import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AeronefForm() {
  const [immat, setImmat] = useState('5R-');
  const [typePlane, setTypePlane] = useState('ATR 72-600');
  const [compagnie, setCompagnie] = useState('Air Madagascar');
  const [statut, setStatut] = useState('au_sol');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!immat || !typePlane) {
      toast.error("L'immatriculation et le type d'appareil sont obligatoires.");
      return;
    }
    toast.success(`Aéronef "${immat}" enregistré avec succès !`);
    setImmat('5R-');
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
          Enregistrement d'un Aéronef (Flotte Malgache)
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Mise à jour de la flotte répertoriée dans le registre national de l'aviation civile
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Immatriculation *
              </label>
              <Input
                placeholder="ex: 5R-EAA"
                value={immat}
                onChange={(e) => setImmat(e.target.value.toUpperCase())}
                className="font-mono font-bold uppercase border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type / Modèle *
              </label>
              <Input
                placeholder="ex: ATR 72-600, Boeing 737..."
                value={typePlane}
                onChange={(e) => setTypePlane(e.target.value)}
                className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exploitant / Compagnie
              </label>
              <Input
                placeholder="ex: Madagascar Airlines, Tsaradia..."
                value={compagnie}
                onChange={(e) => setCompagnie(e.target.value)}
                className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Statut Opérationnel
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="au_sol">Au sol (Parking/Hangar)</option>
                <option value="en_vol">En vol régulier</option>
                <option value="maintenance">En révision / Entretien</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-md shadow-emerald-950"
            >
              <Save className="h-4 w-4" /> Enregistrer l'aéronef
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
