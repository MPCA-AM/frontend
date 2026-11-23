export type AirspaceCategory = {
  id: string;
  label: string;
  code: string;
  typeNum: number;
  namePrefix: string;
  color: string;
  fillColor: string;
  badgeBg: string;
  description: string;
};

/**
 * Les 6 catégories d'espaces aériens de Madagascar dans GeoServer
 * Type 1 : Zone réglementée (FM-R...)
 * Type 2 : Zone dangereuse (FM-D...)
 * Type 3 : Zone interdite (FM-P...)
 * Type 4 : Zone de contrôle (CTR ...)
 * Type 6 : Zone d'information de vol (FIZ ...)
 * Type 7 : Région de contrôle terminale (TMA ...)
 */
export const AIRSPACE_CATEGORIES: AirspaceCategory[] = [
  {
    id: 'regulated',
    label: 'Zone réglementée',
    code: 'R',
    typeNum: 1,
    namePrefix: 'FM-R',
    color: '#9333ea', // Violet
    fillColor: '#f3e8ff',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Zone où le vol est soumis à des conditions strictes et autorisations préalables.',
  },
  {
    id: 'danger',
    label: 'Zone dangereuse',
    code: 'D',
    typeNum: 2,
    namePrefix: 'FM-D',
    color: '#ea580c', // Orange
    fillColor: '#ffedd5',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Zone présentant des activités dangereuses pour le vol (tirs, exercices militaires, etc.).',
  },
  {
    id: 'prohibited',
    label: 'Zone interdite',
    code: 'P',
    typeNum: 3,
    namePrefix: 'FM-P',
    color: '#dc2626', // Rouge vif
    fillColor: '#fee2e2',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    description: 'Espace aérien au-dessus du territoire dans lequel le vol des aéronefs est interdit.',
  },
  {
    id: 'ctr',
    label: 'Zone de contrôle',
    code: 'CTR',
    typeNum: 4,
    namePrefix: 'CTR',
    color: '#2563eb', // Bleu
    fillColor: '#dbeafe',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: "Espace aérien contrôlé entourant un aérodrome pour protéger les trajectoires d'atterrissage/décollage.",
  },
  {
    id: 'fiz',
    label: 'Zone d’information de vol',
    code: 'FIZ',
    typeNum: 6,
    namePrefix: 'FIZ',
    color: '#059669', // Vert émeraude
    fillColor: '#d1fae5',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: "Zone fournissant des services d'information de vol et d'alerte (FIZ / FIR).",
  },
  {
    id: 'tma',
    label: 'Région de contrôle terminale',
    code: 'TMA',
    typeNum: 7,
    namePrefix: 'TMA',
    color: '#0891b2', // Cyan / Bleu canard
    fillColor: '#cffafe',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: "Région de contrôle terminale établie au confluent des routes aériennes aux abords d'aérodromes majeurs.",
  },
];

export const ALL_AIRSPACE_SUBTYPE_IDS = AIRSPACE_CATEGORIES.map((c) => c.id);

/**
 * Construit une clause CQL Filter GeoServer valide selon les sous-catégories cochées.
 * La colonne dans la table GeoServer est 'type' (numérique: 1, 2, 3, 4, 6, 7).
 */
export function buildAirspaceCqlFilter(activeIds: string[]): string | undefined {
  // Si toutes les catégories sont cochées, on ne filtre rien (affiche tout sans surcharge CQL)
  if (activeIds.length >= AIRSPACE_CATEGORIES.length) {
    return undefined;
  }

  // Si aucune catégorie n'est cochée, on masque tout
  if (activeIds.length === 0) {
    return '1=0';
  }

  // Récupérer les numéros de type pour les catégories cochées
  const activeTypes = AIRSPACE_CATEGORIES
    .filter((cat) => activeIds.includes(cat.id))
    .map((cat) => cat.typeNum);

  if (activeTypes.length === 0) {
    return '1=0';
  }

  // Clause CQL valide pour GeoServer (type IN (1, 2, 4))
  return `type IN (${activeTypes.join(', ')})`;
}

/**
 * Retrouve la catégorie d'un espace aérien à partir de son type numérique ou de son nom
 */
export function getAirspaceCategory(
  type?: unknown,
  name?: string | null,
): AirspaceCategory | undefined {
  if (type !== undefined && type !== null && type !== '') {
    const num = Number(type);
    if (!Number.isNaN(num)) {
      const found = AIRSPACE_CATEGORIES.find((c) => c.typeNum === num);
      if (found) return found;
    }
  }

  if (name) {
    const n = name.toUpperCase().trim();
    if (n.startsWith('FM-R')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'regulated');
    if (n.startsWith('FM-D')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'danger');
    if (n.startsWith('FM-P')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'prohibited');
    if (n.startsWith('CTR')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'ctr');
    if (n.includes('FIZ') || n.includes('FIR')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'fiz');
    if (n.startsWith('TMA')) return AIRSPACE_CATEGORIES.find((c) => c.id === 'tma');
  }

  return undefined;
}

/**
 * Retourne true uniquement pour les couches d'espaces aériens de Madagascar
 * qui ont la même structure de données (colonne type numérique 1,2,3,4,6,7) :
 *   - Aviation:airspace
 *   - Aviation:mg_espace_aerienne
 */
export function isAirspaceLayer(name: string, _title = ''): boolean {
  const bare = name.split(':').pop()?.toLowerCase() ?? name.toLowerCase();
  return bare === 'airspace' || bare === 'mg_espace_aerienne';
}

