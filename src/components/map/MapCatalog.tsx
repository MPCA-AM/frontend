import { LoaderCircle, Map as MapIcon, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getLayerLegendLabel, LayerIcon } from '@/layers/LayerIcon';
import type { GeoLayer } from '@/layers/types';

type MapCatalogProps = {
  layers: GeoLayer[];
  status: 'loading' | 'ready' | 'error';
  onReload: () => void;
  onLayersChange: React.Dispatch<React.SetStateAction<GeoLayer[]>>;
};

export function MapCatalog({ layers, status, onReload, onLayersChange }: MapCatalogProps) {
  const toggleLayer = (name: string, selected: boolean) => {
    onLayersChange((items) =>
      items.map((layer) =>
        layer.name === name ? { ...layer, selected, visible: selected } : layer,
      ),
    );
  };

  const selectAllLayers = () => {
    onLayersChange((items) =>
      items.map((layer) => ({ ...layer, selected: true, visible: true })),
    );
  };

  const areAllLayersSelected = layers.length > 0 && layers.every((layer) => layer.selected);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="icon-sm" variant="outline" title="Catalogue des couches" aria-label="Catalogue des couches">
            <MapIcon className="h-4 w-4" />
          </Button>
        }
      />

      <PopoverContent
        side="bottom"
        align="end"
        className="z-[1100] w-72 gap-0 overflow-hidden border border-slate-200 bg-white p-0 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <PopoverHeader className="flex-row items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <PopoverTitle>Catalogue des couches</PopoverTitle>
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" title="Actualiser les couches" onClick={onReload}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {status === 'loading' && (
            <p className="flex items-center gap-2 px-2 py-4 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Chargement des couches…
            </p>
          )}

          {status === 'error' && (
            <p className="px-2 py-4 text-sm text-rose-600">Impossible de lire les couches GeoServer.</p>
          )}

          {status === 'ready' && layers.length > 0 && (
            <label
              className={`mb-1 flex w-full items-center gap-3 rounded-md bg-emerald-50 px-2 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 ${
                areAllLayersSelected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900'
              }`}
            >
              <Checkbox
                checked={areAllLayersSelected}
                disabled={areAllLayersSelected}
                onCheckedChange={(checked) => checked === true && selectAllLayers()}
              />
              <span>Sélectionner toutes les couches</span>
            </label>
          )}

          {status === 'ready' &&
            layers.map((layer) => (
              <label
                key={layer.name}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Checkbox
                  checked={layer.selected}
                  onCheckedChange={(checked) => toggleLayer(layer.name, checked === true)}
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <LayerIcon name={layer.name} title={layer.title} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {getLayerLegendLabel(layer.name, layer.title)}
                </span>
              </label>
            ))}

          {status === 'ready' && layers.length === 0 && (
            <p className="px-2 py-4 text-sm text-slate-500">Aucune couche disponible.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
