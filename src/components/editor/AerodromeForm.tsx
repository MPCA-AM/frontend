import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AerodromeForm() {
  const [aptName, setAptName] = useState('');
  const [oaci, setOaci] = useState('');
  const [iata, setIata] = useState('');
  const [region, setRegion] = useState('Analamanga');
  const [typeApt, setTypeApt] = useState('national');
  const [lat, setLat] = useState('-18.7969');
  const [lng, setLng] = useState('47.4788');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptName || !oaci) {
      toast.error('Le nom et le code OACI sont obligatoires.');
      return;
    }
    toast.success(`Aérodrome "${aptName}" enregistré avec succès !`);
    setAptName('');
    setOaci('');
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
          Fiche Infrastructure Aéronautique
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Ajout ou modification d'une piste ou d'un aéroport dans le système SIG
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nom de la Plateforme *
              </label>
              <Input
                placeholder="ex: Ivato International"
                value={aptName}
                onChange={(e) => setAptName(e.target.value)}
                className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Code OACI (4 lettres) *
              </label>
              <Input
                placeholder="ex: FMMI"
                value={oaci}
                onChange={(e) => setOaci(e.target.value.toUpperCase())}
                className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Code IATA (3 lettres)
              </label>
              <Input
                placeholder="ex: TNR"
                value={iata}
                onChange={(e) => setIata(e.target.value.toUpperCase())}
                className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Région Administrative
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Analamanga">Analamanga (Antananarivo)</option>
                <option value="Diana">Diana (Antsiranana/Nosy-Be)</option>
                <option value="Atsinanana">Atsinanana (Toamasina)</option>
                <option value="Boeny">Boeny (Mahajanga)</option>
                <option value="Atsimo-Andrefana">Atsimo-Andrefana (Toliara)</option>
                <option value="Anosy">Anosy (Fort-Dauphin)</option>
                <option value="Menabe">Menabe (Morondava)</option>
                <option value="Sava">Sava (Sambava/Antalaha)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catégorie
              </label>
              <select
                value={typeApt}
                onChange={(e) => setTypeApt(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="international">Aéroport International</option>
                <option value="national">Aérodrome National Principal</option>
                <option value="regional">Aérodrome Régional / Secondaire</option>
                <option value="militaire">Base Aérienne Militaire</option>
                <option value="prive">Piste Privée</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latitude
                </label>
                <Input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="font-mono text-xs border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Longitude
                </label>
                <Input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="font-mono text-xs border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-md shadow-emerald-950"
            >
              <Save className="h-4 w-4" /> Enregistrer l'aérodrome
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
