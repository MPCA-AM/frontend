import { useEffect, useState } from 'react';
import type { Map as LeafletInstance } from 'leaflet';

type MapScaleProps = {
  map: LeafletInstance | null;
  className?: string;
  maxWidth?: number;
};

type ScaleData = {
  metricWidth: number;
  metricLabel: string;
  nauticalWidth: number;
  nauticalLabel: string;
};

// Trouve un nombre rond approprié (1, 2, 5, 10, 20, 50, 100...)
function getRoundNumber(num: number): number {
  if (num <= 0 || !Number.isFinite(num)) return 1;
  const pow10 = Math.pow(10, Math.floor(Math.log10(num)));
  const d = num / pow10;
  let factor = 1;
  if (d >= 10) factor = 10;
  else if (d >= 5) factor = 5;
  else if (d >= 2) factor = 2;
  else factor = 1;
  return factor * pow10;
}

export function MapScale({ map, className = '', maxWidth = 130 }: MapScaleProps) {
  const [scale, setScale] = useState<ScaleData | null>(null);

  useEffect(() => {
    if (!map) return;

    const calculateScale = () => {
      try {
        const size = map.getSize();
        if (size.x <= 0 || size.y <= 0) return;

        // Mesure la distance au centre de la vue pour la largeur maxWidth
        const y = Math.round(size.y / 2);
        const p1 = map.containerPointToLatLng([0, y]);
        const p2 = map.containerPointToLatLng([maxWidth, y]);
        const maxMeters = map.distance(p1, p2);

        if (!maxMeters || !Number.isFinite(maxMeters) || maxMeters <= 0) return;

        // 1. Échelle Métrique (km / m)
        const roundMeters = getRoundNumber(maxMeters);
        const metricWidth = Math.max(20, Math.round((roundMeters / maxMeters) * maxWidth));
        const metricLabel =
          roundMeters >= 1000 ? `${roundMeters / 1000} km` : `${roundMeters} m`;

        // 2. Échelle Aéronautique (Milles Nautiques - NM) : 1 NM = 1852 mètres
        const maxNautical = maxMeters / 1852;
        const roundNautical = getRoundNumber(maxNautical);
        const nauticalWidth = Math.max(20, Math.round((roundNautical / maxNautical) * maxWidth));
        const nauticalLabel = `${roundNautical} NM`;

        setScale({
          metricWidth,
          metricLabel,
          nauticalWidth,
          nauticalLabel,
        });
      } catch {
        // En cas d'erreur de projection temporaire pendant un zoom rapide
      }
    };

    calculateScale();

    // Réagir aux changements de zoom, déplacement et redimensionnement
    map.on('zoomend', calculateScale);
    map.on('moveend', calculateScale);
    map.on('resize', calculateScale);

    return () => {
      map.off('zoomend', calculateScale);
      map.off('moveend', calculateScale);
      map.off('resize', calculateScale);
    };
  }, [map, maxWidth]);

  if (!scale) return null;

  return (
    <div
      className={`select-none rounded-lg border border-emerald-300/80 bg-emerald-950/95 px-2.5 py-1.5 shadow-lg backdrop-blur-xs transition-all ${className}`.trim()}
      aria-label="Échelle de la carte"
      title="Échelle cartographique (Métrique & Aéronautique NM)"
    >
      {/* Barre Métrique (vert émeraude) */}
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 border-b-2 border-l-2 border-r-2 border-emerald-400"
          style={{ width: `${scale.metricWidth}px` }}
        />
        <span className="font-mono text-[10px] font-bold tracking-tight text-emerald-200">
          {scale.metricLabel}
        </span>
      </div>

      {/* Barre Aéronautique (bleu ciel pour milles nautiques NM) */}
      <div className="mt-1 flex items-center gap-2">
        <div
          className="h-1.5 border-t-2 border-l-2 border-r-2 border-sky-400"
          style={{ width: `${scale.nauticalWidth}px` }}
        />
        <span className="font-mono text-[10px] font-bold tracking-tight text-sky-200">
          {scale.nauticalLabel}
        </span>
      </div>
    </div>
  );
}

