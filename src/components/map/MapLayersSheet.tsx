import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  LoaderCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getLayerLegendLabel, LayerIcon } from '@/layers/LayerIcon';
import type { GeoLayer } from '@/layers/types';
import {
  AIRSPACE_CATEGORIES,
  ALL_AIRSPACE_SUBTYPE_IDS,
  buildAirspaceCqlFilter,
} from '@/layers/airspaceCategories';

type MapLayersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layers: GeoLayer[];
  filteredLayers: GeoLayer[];
  status: 'loading' | 'ready' | 'error';
  geoserver: string;
  workspace: string;
  onRetry: () => void;
  onLayersChange: React.Dispatch<React.SetStateAction<GeoLayer[]>>;
  legendLayerNames: string[];
  onToggleLegendLayer: (layerName: string) => void;
};

type CategoryConfig = {
  id: string;
  title: string;
  description: string;
  filter: (layer: GeoLayer) => boolean;
};

// Retourne true pour les couches dont le nom brut est 'airspace' ou 'mg_espace_aerienne'
function isAirspaceLayerName(name: string): boolean {
  const bare = name.split(':').pop()?.toLowerCase() ?? name.toLowerCase();
  return bare === 'airspace' || bare === 'mg_espace_aerienne';
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'airspace',
    title: 'Espaces aériens et navigation',
    description: "Zones d'information de vol (FIZ), espaces aériens contrôlés, FIR et zones réglementées.",
    filter: (l) => {
      const nom = l.name.toLowerCase();
      const titre = l.title.toLowerCase();
      return (
        nom.includes('airspace') ||
        nom.includes('espace') ||
        nom.includes('fiz') ||
        nom.includes('fir') ||
        titre.includes('espace') ||
        titre.includes('aérien')
      );
    },
  },
  {
    id: 'airports',
    title: 'Infrastructures aéroportuaires',
    description: 'Aéroports internationaux, aérodromes régionaux, pistes et installations au sol.',
    filter: (l) => {
      const nom = l.name.toLowerCase();
      const titre = l.title.toLowerCase();
      return (
        nom.includes('teste') ||
        nom.includes('aeroport') ||
        nom.includes('piste') ||
        titre.includes('aéroport') ||
        titre.includes('piste')
      );
    },
  },
  {
    id: 'admin',
    title: 'Limites administratives',
    description: 'Découpage territorial, districts et régions administratives de Madagascar.',
    filter: (l) => {
      const nom = l.name.toLowerCase();
      const titre = l.title.toLowerCase();
      return (
        nom.includes('district') ||
        nom.includes('region') ||
        titre.includes('district') ||
        titre.includes('région')
      );
    },
  },
  {
    id: 'other',
    title: 'Autres données et cartographie',
    description: 'Couches thématiques, géographiques et repères supplémentaires.',
    filter: (l) => {
      const nom = l.name.toLowerCase();
      const titre = l.title.toLowerCase();
      // Exclure les espaces aériens (airspace + mg_espace_aerienne + toute couche avec 'espace' dans le titre)
      const estAirspace =
        nom.includes('airspace') ||
        nom.includes('espace') ||
        titre.includes('espace') ||
        titre.includes('aérien');
      const estAirport = nom.includes('teste') || titre.includes('aéroport');
      const estAdmin = nom.includes('district') || titre.includes('district');
      return !estAirspace && !estAirport && !estAdmin;
    },
  },
];

function getLegendUrl(geoserver: string, workspace: string, layerName: string) {
  const params = new URLSearchParams({
    service: 'WMS',
    request: 'GetLegendGraphic',
    format: 'image/png',
    layer: layerName,
  });
  return `${geoserver}/${workspace}/wms?${params.toString()}`;
}

function getDynamicLayerDescription(name: string, title: string): string {
  const n = name.toLowerCase();
  const t = title.toLowerCase();
  if (n.includes('airspace') || t.includes('espace')) {
    return "Espace aérien de Madagascar (FIZ, FIR, TMA). Réglementation du trafic, plafonds et informations de vol.";
  }
  if (n.includes('teste') || n.includes('aeroport') || t.includes('aéroport')) {
    return "Infrastructures et aérodromes civils. Coordonnées GPS, codes OACI/IATA et statut d'exploitation.";
  }
  if (n.includes('district') || t.includes('district')) {
    return "Découpage administratif officiel des districts et territoires régionaux de Madagascar.";
  }
  return `Couche géographique « ${title} » (${name}) intégrée, active et affiche.`;
}

export function MapLayersSheet({
  open,
  onOpenChange,
  layers,
  filteredLayers,
  status,
  geoserver,
  workspace,
  onRetry,
  onLayersChange,
  legendLayerNames,
  onToggleLegendLayer,
}: MapLayersSheetProps) {
  // Accordéon des catégories comme l'image 2
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    airspace: true,
    airports: false,
    admin: false,
    other: false,
  });

  // Légende déroulante par couche
  const [openLegends, setOpenLegends] = useState<Record<string, boolean>>({});

  // Infobulle d'aide pour le bouton ?
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Panneaux de sous-catégories (ex: filtrage des 6 types d'espaces aériens)
  const [openAirspacePanels, setOpenAirspacePanels] = useState<Record<string, boolean>>({});

  const toggleAirspacePanel = (layerName: string) => {
    setOpenAirspacePanels((prev) => ({
      ...prev,
      [layerName]: prev[layerName] === undefined ? false : !prev[layerName],
    }));
  };

  const toggleAirspaceSubtype = (layerName: string, subtypeId: string) => {
    onLayersChange((items) =>
      items.map((item) => {
        if (item.name !== layerName) return item;
        const current = item.activeSubtypes ?? ALL_AIRSPACE_SUBTYPE_IDS;
        const next = current.includes(subtypeId)
          ? current.filter((id) => id !== subtypeId)
          : [...current, subtypeId];
        const newCql = buildAirspaceCqlFilter(next);
        return {
          ...item,
          visible: true,
          selected: true,
          activeSubtypes: next,
          cqlFilter: newCql,
        };
      })
    );
  };

  const setAllAirspaceSubtypes = (layerName: string, selectAll: boolean) => {
    const next = selectAll ? ALL_AIRSPACE_SUBTYPE_IDS : [];
    const newCql = buildAirspaceCqlFilter(next);
    onLayersChange((items) =>
      items.map((item) =>
        item.name === layerName
          ? {
              ...item,
              visible: selectAll ? true : item.visible,
              selected: true,
              activeSubtypes: next,
              cqlFilter: newCql,
            }
          : item
      )
    );
  };

  /** Handler générique pour les couches non-airspace (mg_obstacle, mg_navigation, park) */
  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleLegend = (layerName: string) => {
    setOpenLegends((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const toggleVisibility = (layerName: string) => {
    onLayersChange((items) =>
      items.map((item) =>
        item.name === layerName
          ? { ...item, visible: !item.visible, selected: true }
          : item,
      ),
    );
  };

  const updateOpacity = (layerName: string, values: number | readonly number[]) => {
    const opacity = Array.isArray(values) ? values[0] : values;
    onLayersChange((items) =>
      items.map((item) =>
        item.name === layerName && opacity !== undefined ? { ...item, opacity } : item,
      ),
    );
  };

  return (
    <aside
      className={`absolute inset-y-0 left-0 z-[800] flex w-[360px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      aria-label="Gestion des couches"
    >
      {/* En-tête du volet */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-emerald-600 px-5 text-white dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5" />
          <h2 className="text-base font-bold text-white">Gestion des couches</h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
          title="Fermer le panneau"
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Contenu déroulant avec accordéons (comme l'image 2) */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        {status === 'loading' && (
          <p className="flex items-center gap-2 p-5 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Chargement des couches…
          </p>
        )}

        {status === 'error' && (
          <div className="p-5 text-sm text-rose-600">
            Connexion GeoServer impossible.
            <Button variant="link" className="px-1" onClick={onRetry}>
              Réessayer
            </Button>
          </div>
        )}

        {status === 'ready' && !layers.length && (
          <p className="p-5 text-sm text-slate-500">Aucune couche disponible.</p>
        )}

        {status === 'ready' &&
          CATEGORIES.map((category) => {
            const categoryLayers = filteredLayers.filter(category.filter);
            const isCategoryOpen = !!openCategories[category.id];

            // N'affiche pas les catégories vides sauf si c'est la première ou si recherche vide
            if (categoryLayers.length === 0 && filteredLayers.length > 0 && category.id === 'other') {
              return null;
            }

            return (
              <div key={category.id} className="border-b border-slate-100 dark:border-slate-800">
                {/* Ligne catégorie principale avec Chevron comme Image 2 */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {category.title}
                  </span>
                  {isCategoryOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </button>

                {/* Contenu de la catégorie dépliée */}
                {isCategoryOpen && (
                  <div className="bg-slate-50/50 pb-3 pl-5 pr-4 pt-1 dark:bg-slate-900/50">
                    {categoryLayers.length === 0 ? (
                      <p className="py-2 text-xs italic text-slate-400">
                        Aucune couche dans cette catégorie
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {categoryLayers.map((layer) => {
                          const isLegendOpen = !!openLegends[layer.name];
                          const isTooltipOpen = activeTooltip === layer.name;

                          return (
                            <div
                              key={layer.name}
                              className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-800/80"
                            >
                              {/* Ligne couche avec radio/checkbox et bouton ? comme Image 2 */}
                              <div className="flex items-center gap-2.5">
                                {/* Bouton radio/checkbox stylé comme image 2 */}
                                <button
                                  type="button"
                                  onClick={() => toggleVisibility(layer.name)}
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${layer.visible
                                    ? 'border-[#1976d2] bg-white ring-2 ring-[#1976d2]/20'
                                    : 'border-slate-400 bg-white hover:border-slate-600'
                                    }`}
                                  title={layer.visible ? 'Masquer la couche' : 'Afficher la couche'}
                                >
                                  {layer.visible && (
                                    <span className="h-2 w-2 rounded-full bg-[#1976d2]" />
                                  )}
                                </button>

                                {/* Icône de la couche */}
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white">
                                  <LayerIcon name={layer.name} title={layer.title} className="h-4 w-4" />
                                </span>

                                {/* Nom de la couche */}
                                <span
                                  onClick={() => toggleVisibility(layer.name)}
                                  className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                  {getLayerLegendLabel(layer.name, layer.title)}
                                </span>

                                {/* Bouton ? bleu comme image 2 */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveTooltip(isTooltipOpen ? null : layer.name)
                                    }
                                    title="Information sur cette couche"
                                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-bold text-white shadow-xs transition hover:bg-[#2563eb]"
                                  >
                                    ?
                                  </button>

                                  {isTooltipOpen && (
                                    <div className="absolute right-0 top-6 z-30 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                                      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-700">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                          {getLayerLegendLabel(layer.name, layer.title)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setActiveTooltip(null)}
                                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>

                                      <div className="space-y-1.5 text-[11px]">
                                        <div className="flex items-start justify-between gap-1">
                                          <span className="font-semibold text-slate-500">Attribut Name :</span>
                                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                                            {layer.name}
                                          </span>
                                        </div>
                                        <div className="flex items-start justify-between gap-1">
                                          <span className="font-semibold text-slate-500">Titre :</span>
                                          <span className="text-right">{layer.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-slate-500">Opacité :</span>
                                          <span>{layer.opacity}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-slate-500">Statut :</span>
                                          <span className={layer.visible ? 'font-medium text-emerald-600' : 'text-slate-400'}>
                                            {layer.visible ? 'Active (affichée)' : 'Inactive'}
                                          </span>
                                        </div>
                                      </div>

                                      <p className="mt-2.5 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                        {getDynamicLayerDescription(layer.name, layer.title)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Case à cocher pour afficher la couche sur la légende SLD */}
                              <div className="mt-2.5 flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/40">
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={legendLayerNames.includes(layer.name)}
                                    onChange={() => onToggleLegendLayer(layer.name)}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span>Afficher sur la légende SLD</span>
                                </label>
                                {legendLayerNames.includes(layer.name) && (
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    Cochée
                                  </span>
                                )}
                              </div>

                              {/* Sous-catégories spécifiques pour afficher/masquer les types d'espaces aériens sur la carte */}
                              {isAirspaceLayerName(layer.name) && (
                                <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-900/40">
                                    <button
                                      type="button"
                                      onClick={() => toggleAirspacePanel(layer.name)}
                                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-100 hover:text-emerald-700"
                                    >
                                      <span>Types d'espaces aériens</span>
                                      <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                        {(layer.activeSubtypes ?? ALL_AIRSPACE_SUBTYPE_IDS).length}/{AIRSPACE_CATEGORIES.length}
                                      </span>
                                      <ChevronDown
                                        className={`h-3.5 w-3.5 text-emerald-700 transition-transform ${
                                          (openAirspacePanels[layer.name] ?? true) ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </button>

                                    <div className="flex items-center gap-1 text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => setAllAirspaceSubtypes(layer.name, true)}
                                        className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                                      >
                                        Tous
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => setAllAirspaceSubtypes(layer.name, false)}
                                        className="font-semibold text-slate-500 hover:underline dark:text-slate-400"
                                      >
                                        Aucun
                                      </button>
                                    </div>
                                  </div>

                                  {(openAirspacePanels[layer.name] ?? true) && (
                                    <div className="mt-2 space-y-1.5">
                                      {AIRSPACE_CATEGORIES.map((category) => {
                                        const currentSubtypes = layer.activeSubtypes ?? ALL_AIRSPACE_SUBTYPE_IDS;
                                        const isChecked = currentSubtypes.includes(category.id);

                                        return (
                                          <label
                                            key={category.id}
                                            className={`flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs transition ${
                                              isChecked
                                                ? 'bg-white shadow-2xs dark:bg-slate-800'
                                                : 'opacity-50 hover:opacity-80'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() =>
                                                  toggleAirspaceSubtype(layer.name, category.id)
                                                }
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                              />
                                              <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                              />
                                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                                {category.label}
                                              </span>
                                            </div>

                                            <span
                                              className="rounded px-1.5 py-0.5 text-[9px] font-bold font-mono"
                                              style={{
                                                backgroundColor: category.fillColor,
                                                color: category.color,
                                              }}
                                            >
                                              {category.code}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Si la couche est visible, on affiche le curseur d'opacité et le menu déroulant de la légende */}
                              {layer.visible && (
                                <div className="mt-2.5 border-t border-slate-100 pt-2.5 dark:border-slate-700/60">
                                  {/* Curseur d'opacité */}
                                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="w-10 font-medium">{layer.opacity}%</span>
                                    <Slider
                                      value={[layer.opacity]}
                                      onValueChange={(values) =>
                                        updateOpacity(layer.name, values)
                                      }
                                      min={0}
                                      max={100}
                                      step={5}
                                      className="flex-1"
                                    />
                                  </div>

                                  {/* Menu déroulant de la légende (taille normale, pliable/dépliable) */}
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleLegend(layer.name)}
                                      className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                      <span>Légende</span>
                                      <span className="text-[10px] font-normal text-slate-400">
                                        {isLegendOpen ? 'Masquer' : 'Détails'}
                                      </span>
                                      <ChevronDown
                                        className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isLegendOpen ? 'rotate-180' : ''
                                          }`}
                                      />
                                    </button>

                                    {isLegendOpen && (
                                      <div className="mt-1.5 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-700 dark:bg-slate-900">
                                        <img
                                          className="h-auto max-w-full object-contain"
                                          src={getLegendUrl(geoserver, workspace, layer.name)}
                                          alt={`Légende ${getLayerLegendLabel(layer.name, layer.title)}`}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
}
