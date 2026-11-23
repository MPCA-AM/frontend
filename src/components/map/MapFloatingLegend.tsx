import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { GeoLayer } from '@/layers/types';
import { getLayerLegendLabel } from '@/layers/LayerIcon';

type MapFloatingLegendProps = {
  geoserver: string;
  workspace: string;
  legendLayers: GeoLayer[];
};

export function getLegendGraphicUrl(
  geoserver: string,
  workspace: string,
  layerName: string,
) {
  const params = new URLSearchParams({
    service: 'WMS',
    request: 'GetLegendGraphic',
    format: 'image/png',
    transparent: 'true',
    layer: layerName,
    legend_options: 'forceLabels:on;fontName:sans-serif;fontSize:11;dpi:96',
  });
  return `${geoserver}/${workspace}/wms?${params.toString()}`;
}

export function MapFloatingLegend({
  geoserver,
  workspace,
  legendLayers,
}: MapFloatingLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-5 right-5 z-[500] w-72 max-w-[calc(100%-2.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* En-tête de la légende */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          <span>Légende </span>
          {legendLayers.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {legendLayers.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {/* Corps dépliable affichant les légendes SLD réelles de GeoServer */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto p-3 text-xs text-slate-700 dark:text-slate-300">
          {legendLayers.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
              <p className="italic">Aucune couche cochée pour la légende.</p>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Cochez la case « Légende » d'une couche dans la gestion des couches.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {legendLayers.map((layer) => (
                <div
                  key={layer.name}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-1.5 dark:border-slate-700">
                    <span className="truncate font-semibold text-[11px] text-slate-800 dark:text-slate-100">
                      {getLayerLegendLabel(layer.name, layer.title)}
                    </span>
                    {/* <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      SLD
                    </span> */}
                  </div>

                  {/* Image de légende SLD générée directement par GeoServer */}
                  <div className="overflow-x-auto rounded bg-white p-2 shadow-xs dark:bg-slate-900">
                    <img
                      src={getLegendGraphicUrl(geoserver, workspace, layer.name)}
                      alt={`Légende SLD ${getLayerLegendLabel(layer.name, layer.title)}`}
                      className="h-auto max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
