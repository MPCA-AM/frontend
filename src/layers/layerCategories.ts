/**
 * Système générique de sous-catégories de couches GeoServer.
 * Chaque couche peut avoir ses propres catégories avec un filtre CQL approprié.
 */

export type LayerSubCategory = {
  id: string;
  label: string;
  code: string;
  color: string;
  fillColor: string;
  description: string;
};

export type LayerCategoryConfig = {
  /** Nom brut de la couche GeoServer (sans workspace), ex: 'mg_obstacle' */
  layerName: string;
  /** Label affiché dans l'UI */
  sectionLabel: string;
  categories: LayerSubCategory[];
  /**
   * Construit le filtre CQL à partir des ids actifs.
   * Doit retourner undefined si tout est actif, '1=0' si rien n'est actif.
   */
  buildCqlFilter: (activeIds: string[]) => string | undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// mg_obstacle
// type (number): 0=Éolienne, 2=Phare/Bâtiment, 4=Antenne/Mât
// ─────────────────────────────────────────────────────────────────────────────
export const OBSTACLE_CATEGORIES: LayerSubCategory[] = [
  {
    id: 'wind',
    label: 'Éolienne',
    code: 'WT',
    color: '#16a34a',
    fillColor: '#dcfce7',
    description: 'Éoliennes et générateurs de vent (type 0).',
  },
  {
    id: 'building',
    label: 'Phare / Bâtiment',
    code: 'BLD',
    color: '#d97706',
    fillColor: '#fef3c7',
    description: 'Phares, bâtiments industriels élevés (type 2).',
  },
  {
    id: 'antenna',
    label: 'Antenne / Mât',
    code: 'ANT',
    color: '#dc2626',
    fillColor: '#fee2e2',
    description: 'Antennes de télécommunication et mâts (type 4).',
  },
];

export const ALL_OBSTACLE_IDS = OBSTACLE_CATEGORIES.map((c) => c.id);

const OBSTACLE_TYPE_MAP: Record<string, number> = {
  wind: 0,
  building: 2,
  antenna: 4,
};

export function buildObstacleCqlFilter(activeIds: string[]): string | undefined {
  if (activeIds.length >= OBSTACLE_CATEGORIES.length) return undefined;
  if (activeIds.length === 0) return '1=0';
  const nums = activeIds.map((id) => OBSTACLE_TYPE_MAP[id]).filter((n) => n !== undefined);
  return nums.length === 0 ? '1=0' : `type IN (${nums.join(', ')})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// mg_navigation
// type (number): 0=NDB(autre), 2=NDB (radiobalise), 4=VOR/DME
// ─────────────────────────────────────────────────────────────────────────────
export const NAVIGATION_CATEGORIES: LayerSubCategory[] = [
  {
    id: 'ndb_other',
    label: 'NDB / Autre',
    code: 'NDB',
    color: '#7c3aed',
    fillColor: '#ede9fe',
    description: 'Radiobalises non-directionnelles et aides de navigation diverses (type 0).',
  },
  {
    id: 'ndb',
    label: 'NDB (Non-Directionnel)',
    code: 'NDB+',
    color: '#2563eb',
    fillColor: '#dbeafe',
    description: 'Radiobalises NDB utilisées pour l approche et le guidage IFR (type 2).',
  },
  {
    id: 'vor',
    label: 'VOR / DME',
    code: 'VOR',
    color: '#0891b2',
    fillColor: '#cffafe',
    description: 'Radiophares omnidirectionnels VHF et équipements DME (type 4).',
  },
];

export const ALL_NAVIGATION_IDS = NAVIGATION_CATEGORIES.map((c) => c.id);

const NAVIGATION_TYPE_MAP: Record<string, number> = {
  ndb_other: 0,
  ndb: 2,
  vor: 4,
};

export function buildNavigationCqlFilter(activeIds: string[]): string | undefined {
  if (activeIds.length >= NAVIGATION_CATEGORIES.length) return undefined;
  if (activeIds.length === 0) return '1=0';
  const nums = activeIds.map((id) => NAVIGATION_TYPE_MAP[id]).filter((n) => n !== undefined);
  return nums.length === 0 ? '1=0' : `type IN (${nums.join(', ')})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// park
// fclass (string): national_park, nature_reserve, iucn_1, iucn_4, iucn_5, iucn_6
// ─────────────────────────────────────────────────────────────────────────────
export const PARK_CATEGORIES: LayerSubCategory[] = [
  {
    id: 'national_park',
    label: 'Parc national',
    code: 'PN',
    color: '#16a34a',
    fillColor: '#dcfce7',
    description: 'Aires protégées classées parc national (66 zones).',
  },
  {
    id: 'nature_reserve',
    label: 'Réserve naturelle',
    code: 'RN',
    color: '#059669',
    fillColor: '#d1fae5',
    description: 'Réserves naturelles et zones de conservation (54 zones).',
  },
  {
    id: 'iucn',
    label: 'Zone UICN (I / IV / V / VI)',
    code: 'UICN',
    color: '#0d9488',
    fillColor: '#ccfbf1',
    description: 'Aires protégées classifiées selon les catégories UICN I, IV, V et VI.',
  },
];

export const ALL_PARK_IDS = PARK_CATEGORIES.map((c) => c.id);

const PARK_FCLASS_MAP: Record<string, string[]> = {
  national_park: ['national_park'],
  nature_reserve: ['nature_reserve'],
  iucn: ['iucn_1', 'iucn_4', 'iucn_5', 'iucn_6'],
};

export function buildParkCqlFilter(activeIds: string[]): string | undefined {
  if (activeIds.length >= PARK_CATEGORIES.length) return undefined;
  if (activeIds.length === 0) return '1=0';
  const fclasses = activeIds.flatMap((id) => PARK_FCLASS_MAP[id] ?? []);
  if (fclasses.length === 0) return '1=0';
  const quoted = fclasses.map((f) => `'${f}'`).join(', ');
  return `fclass IN (${quoted})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registre centralisé pour toutes les couches avec sous-catégories
// ─────────────────────────────────────────────────────────────────────────────
export type LayerCategoryKey = 'mg_obstacle' | 'mg_navigation' | 'park';

export function getLayerCategories(layerName: string): {
  categories: LayerSubCategory[];
  allIds: string[];
  buildCqlFilter: (activeIds: string[]) => string | undefined;
  sectionLabel: string;
} | undefined {
  const bare = layerName.split(':').pop()?.toLowerCase() ?? layerName.toLowerCase();

  if (bare === 'mg_obstacle') {
    return {
      categories: OBSTACLE_CATEGORIES,
      allIds: ALL_OBSTACLE_IDS,
      buildCqlFilter: buildObstacleCqlFilter,
      sectionLabel: 'Types d\'obstacles',
    };
  }
  if (bare === 'mg_navigation') {
    return {
      categories: NAVIGATION_CATEGORIES,
      allIds: ALL_NAVIGATION_IDS,
      buildCqlFilter: buildNavigationCqlFilter,
      sectionLabel: 'Aides à la navigation',
    };
  }
  if (bare === 'park') {
    return {
      categories: PARK_CATEGORIES,
      allIds: ALL_PARK_IDS,
      buildCqlFilter: buildParkCqlFilter,
      sectionLabel: 'Types d\'aires protégées',
    };
  }
  return undefined;
}

/** Retourne true si la couche a des sous-catégories configurées */
export function hasLayerCategories(name: string): boolean {
  return getLayerCategories(name) !== undefined;
}

