import { Building2, CarTaxiFront, Helicopter, Map, Plane, PlaneLanding, Route, Warehouse, type LucideIcon } from 'lucide-react';

const ICONS: Array<{ matches: string[]; Icon: LucideIcon }> = [
  { matches: ['aerodrome', 'aérodrome', 'airport', 'aéroport', 'airstrip', 'teste'], Icon: Plane },
  { matches: ['helipad', 'heliport', 'hélipad', 'héliport'], Icon: Helicopter },
  { matches: ['taxiway', 'taxiroute', 'taxi route'], Icon: CarTaxiFront },
  { matches: ['runway', 'piste'], Icon: PlaneLanding },
  { matches: ['route', 'road', 'voie'], Icon: Route },
  { matches: ['terminal', 'aérogare'], Icon: Building2 },
  { matches: ['hangar'], Icon: Warehouse },
  { matches: ['district', 'region', 'arrondissement'], Icon: Map },
];

const LEGEND_LABELS: Record<string, string> = {
  aerodrome: 'Aérodrome (symbole)',
  aerodrome2: 'Aérodrome (emprise)',
  airspace: 'Espace aérien',
  airstrip: 'Piste d’atterrissage',
  apron: 'Aire de trafic',
  district: 'District',
  hangar: 'Hangar',
  helipad: 'Hélisurface (symbole)',
  helipad2: 'Hélisurface (surface)',
  runway: 'Piste d’envol et d’atterrissage (symbole)',
  runway2: 'Piste (emprise)',
  taxiway: 'Voie de circulation (axe)',
  taxiway2: 'Voie de circulation (surface)',
  terminal: 'Aérogare',
  teste: 'Aéroport',
};

export function getLayerLegendLabel(name: string, fallback: string) {
  const layerName = name.split(':').at(-1)?.toLowerCase() ?? name.toLowerCase();
  return LEGEND_LABELS[layerName] ?? fallback;
}

export function getLayerLegendStyle(name: string, title = '') {
  const normalized = `${name} ${title}`.toLowerCase();
  if (['district', 'region', 'arrondissement'].some((match) => normalized.includes(match)))
    return { color: '#8b5cf6', fill: '#ede9fe', shape: 'border' as const };
  if (['aerodrome', 'aérodrome', 'airport', 'aéroport', 'airstrip', 'teste'].some((match) => normalized.includes(match)))
    return { color: '#2563eb', fill: '#dbeafe', shape: 'point' as const };
  if (['helipad', 'heliport', 'hélipad', 'héliport'].some((match) => normalized.includes(match)))
    return { color: '#db2777', fill: '#fce7f3', shape: 'point' as const };
  if (['runway', 'piste'].some((match) => normalized.includes(match)))
    return { color: '#2563eb', fill: '#dbeafe', shape: 'line' as const };
  if (['taxiway', 'taxiroute', 'taxi route'].some((match) => normalized.includes(match)))
    return { color: '#f59e0b', fill: '#fef3c7', shape: 'line' as const };
  if (['terminal', 'aérogare', 'hangar'].some((match) => normalized.includes(match)))
    return { color: '#64748b', fill: '#e2e8f0', shape: 'area' as const };
  return { color: '#0f766e', fill: '#ccfbf1', shape: 'area' as const };
}

export function LayerIcon({ name, title = '', className = 'h-5 w-5' }: { name: string; title?: string; className?: string }) {
  const normalized = `${name} ${title}`.toLowerCase();
  const Icon = ICONS.find((item) => item.matches.some((match) => normalized.includes(match)))?.Icon ?? Map;
  return <Icon className={className} />;
}
