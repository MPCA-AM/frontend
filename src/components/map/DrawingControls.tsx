import { LockKeyhole, Pentagon, Ruler, Trash2, Waypoints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Point } from '@/layers/types';

type DrawingMode = 'line' | 'polygon' | null;

type DrawingControlsProps = {
  mode: DrawingMode;
  canDraw: boolean;
  points: Point[];
  onModeChange: (mode: DrawingMode) => void;
  onClear: () => void;
};

const RAYON_TERRE = 6371008.8;

function degresEnRadians(val: number): number {
  return (val * Math.PI) / 180;
}

function calculerDistance(p1: Point, p2: Point): number {
  const dLat = degresEnRadians(p2.lat - p1.lat);
  const dLng = degresEnRadians(p2.lng - p1.lng);
  const lat1 = degresEnRadians(p1.lat);
  const lat2 = degresEnRadians(p2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * RAYON_TERRE * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLigne(points: Point[], boucle = false): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculerDistance(points[i], points[i + 1]);
  }
  if (boucle && points.length > 2) {
    total += calculerDistance(points[points.length - 1], points[0]);
  }
  return total;
}

function surfacePolygone(points: Point[]): number {
  if (points.length < 3) return 0;
  let somme = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    somme +=
      degresEnRadians(p2.lng - p1.lng) *
      (2 + Math.sin(degresEnRadians(p1.lat)) + Math.sin(degresEnRadians(p2.lat)));
  }
  return (Math.abs(somme) * RAYON_TERRE ** 2) / 2;
}

function formaterDistance(metres: number): string {
  if (metres >= 1000) {
    return `${(metres / 1000).toFixed(2)} km`;
  }
  return `${Math.round(metres)} m`;
}

function formaterSurface(metresCarres: number): string {
  if (metresCarres >= 1000000) {
    return `${(metresCarres / 1000000).toFixed(2)} km²`;
  }
  if (metresCarres >= 10000) {
    return `${(metresCarres / 10000).toFixed(2)} ha`;
  }
  return `${Math.round(metresCarres)} m²`;
}

export function DrawingControls({
  mode,
  canDraw,
  points,
  onModeChange,
  onClear,
}: DrawingControlsProps) {
  const toggleMode = (nextMode: Exclude<DrawingMode, null>) => {
    onModeChange(mode === nextMode ? null : nextMode);
  };

  return (
    <div className="absolute left-4 top-36 z-[500] flex flex-col items-start">
      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <Button
          size="icon-sm"
          variant={mode === 'line' ? 'default' : 'ghost'}
          title={canDraw ? 'Dessiner une ligne' : 'Connectez-vous pour dessiner'}
          disabled={!canDraw}
          onClick={() => toggleMode('line')}
        >
          <Waypoints className="h-4 w-4" />
        </Button>

        <Button
          size="icon-sm"
          variant={mode === 'polygon' ? 'default' : 'ghost'}
          title={canDraw ? 'Dessiner un polygone' : 'Connectez-vous pour dessiner'}
          disabled={!canDraw}
          onClick={() => toggleMode('polygon')}
        >
          <Pentagon className="h-4 w-4" />
        </Button>

        {canDraw ? (
          <Button size="icon-sm" variant="ghost" title="Effacer le dessin" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <div
            className="flex h-9 items-center justify-center border-t border-slate-200 text-slate-400 dark:border-slate-700"
            title="Connexion requise"
          >
            <LockKeyhole className="h-4 w-4" />
          </div>
        )}
      </div>

      {mode === 'line' && (
        <div className="mt-2 min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <Ruler className="h-3.5 w-3.5" /> Distance
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {formaterDistance(distanceLigne(points))}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {points.length} point{points.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {mode === 'polygon' && (
        <div className="mt-2 min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Surface</p>
          <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {formaterSurface(surfacePolygone(points))}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Périmètre : {formaterDistance(distanceLigne(points, true))}
          </p>
        </div>
      )}
    </div>
  );
}
