import { useState } from 'react';
import {
  Crop,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { GeoFeature } from '@/layers/types';
import type { RestrictionAssessment } from '@/layers/geoserver';
import { getAirspaceCategory } from '@/layers/airspaceCategories';

// ─── Champs à masquer (géométrie, identifiants internes, etc.) ───────────────
const HIDDEN_KEYS = /^(geom|geometry|the_geom|___id|objectid|fid|gid|ogc_fid)$/i;

// ─── Libellés lisibles pour les clés connues ─────────────────────────────────
const KEY_LABELS: Record<string, string> = {
  name: 'Nom',
  type: 'Type (num)',
  type_code: 'Code type',
  type_label: 'Type',
  icaoclass: 'Classe ICAO',
  activity: 'Activité',
  country: 'Pays',
  upperlimit: 'Limite supérieure',
  lowerlimit: 'Limite inférieure',
  upper_limit: 'Limite supérieure',
  lower_limit: 'Limite inférieure',
  upper_valu: 'Plafond max (m)',
  lower_valu: 'Plancher min (m)',
  max_upper_limit: 'Plafond max',
  min_lower_limit: 'Plancher min',
  hoursofope: 'Heures d\'opération',
  frequencie: 'Fréquences',
  createdat: 'Créé le',
  updatedat: 'Modifié le',
  createdby: 'Créé par',
  updatedby: 'Modifié par',
  dataingest: 'Données ingérées',
  deletable: 'Supprimable',
  identifier: 'Identifiant',
  channel: 'Canal',
  frequency: 'Fréquence',
  elevation: 'Élévation',
  elevationg: 'Élévation (sol)',
  magneticde: 'Déviation magnétique',
  alignedtru: 'Aligné vrai nord',
  height: 'Hauteur',
  height_val: 'Valeur hauteur',
  height_v: 'Hauteur (m)',
  osmid: 'OSM ID',
  osmtags: 'Tags OSM',
  fclass: 'Classe',
  code: 'Code',
  osm_id: 'OSM ID',
};

// Priorité pour les 5 attributs les plus importants
const PRIORITY_ORDER = [
  'type_label',
  'icaoclass',
  'activity',
  'country',
  'upperlimit',
  'lowerlimit',
  'upper_limit',
  'lower_limit',
  'frequency',
  'identifier',
  'fclass',
  'height',
  'elevation',
  'type_code',
  'type',
  'code',
];

function labelFor(key: string): string {
  return KEY_LABELS[key.toLowerCase()] ?? key;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
  if (typeof val === 'object') {
    try {
      const obj = val as Record<string, unknown>;
      // Fréquence avec unité
      if ('value' in obj && 'unit' in obj) {
        const unit = obj.unit === 1 ? 'kHz' : obj.unit === 2 ? 'MHz' : '';
        return `${obj.value} ${unit}`.trim();
      }
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

// ─── Types exportés (compatibilité avec le reste du code) ────────────────────
export type AirspaceDetailData = {
  name: string;
  type: string;
  icaoClass?: string;
  activity?: string;
  country?: string;
  upperLimit?: string;
  lowerLimit?: string;
  maxUpperLimit?: string;
  minLowerLimit?: string;
  rawProperties?: Record<string, unknown>;
};

export const DEFAULT_AIRSPACE_DETAIL: AirspaceDetailData = {
  name: 'Entité sélectionnée',
  type: 'Espace aérien / Zone géographique',
  country: 'Madagascar',
};

export function convertFeatureToAirspaceDetail(
  feature?: GeoFeature | null,
): AirspaceDetailData {
  if (!feature || !feature.properties) return DEFAULT_AIRSPACE_DETAIL;

  const p = feature.properties;

  const getProp = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const entry = Object.entries(p).find(
        ([k]) => k.toLowerCase() === key.toLowerCase(),
      );
      if (entry && entry[1] !== null && entry[1] !== undefined && entry[1] !== '') {
        return String(entry[1]);
      }
    }
    return undefined;
  };

  const name =
    getProp('name', 'nom', 'designator', 'ident', 'airport_name', 'titre') ||
    (feature.id ? String(feature.id).split('.').pop() : 'Entité sélectionnée');

  const rawType = getProp('type', 'type_code', 'fclass', 'class', 'airspace_type');
  const airspaceCat = getAirspaceCategory(rawType, name);
  const type = airspaceCat
    ? `${airspaceCat.label} (${airspaceCat.code})`
    : getProp('type_label') || rawType || 'Espace aérien / Zone géographique';

  const icaoClass =
    getProp('icao_class', 'icaocode', 'code_oaci', 'icao', 'classe_oaci') ||
    getProp('iata', 'code_iata', 'iatacode');

  const activity = getProp('activity', 'activite', 'status', 'statut', 'description');
  const country = getProp('country', 'pays', 'region', 'nation') || 'Madagascar';
  const upperLimit = getProp('upper_limit', 'upperlimit', 'upper_val', 'upper', 'plafond', 'elevation');
  const lowerLimit = getProp('lower_limit', 'lowerlimit', 'lower_val', 'lower', 'plancher');
  const maxUpperLimit = getProp('max_upper_limit', 'upper_valu', 'max_upper', 'max_alt');
  const minLowerLimit = getProp('min_lower_limit', 'lower_valu', 'min_lower');

  return {
    name: name || 'Entité sélectionnée',
    type,
    icaoClass,
    activity,
    country,
    upperLimit,
    lowerLimit,
    maxUpperLimit,
    minLowerLimit,
    rawProperties: p,
  };
}

// ─── Modal ───────────────────────────────────────────────────────────────────
type AirspaceDetailModalProps = {
  open: boolean;
  onClose: () => void;
  data?: Partial<AirspaceDetailData>;
  restriction?: RestrictionAssessment | null;
  checkingRestriction?: boolean;
  onCheckRestrictions?: () => void;
};

export function AirspaceDetailModal({ open, onClose, data, restriction, checkingRestriction, onCheckRestrictions }: AirspaceDetailModalProps) {
  const [showMoreProps, setShowMoreProps] = useState(false);

  if (!open) return null;

  const name = data?.name || DEFAULT_AIRSPACE_DETAIL.name;
  const type = data?.type || DEFAULT_AIRSPACE_DETAIL.type;
  const rawProps = data?.rawProperties ?? {};
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const uasFormUrl = `${apiUrl}/documents/uas-request-form`;

  // Tous les attributs non vides et non internes (hors nom qui est dans le titre)
  const allAttributes = Object.entries(rawProps).filter(([k, v]) => {
    if (HIDDEN_KEYS.test(k)) return false;
    if (v === null || v === undefined || v === '') return false;
    if (k.toLowerCase() === 'name') return false;
    return true;
  });

  // Trier par priorité pour sélectionner les plus importants en premier
  const sortedByPriority = [...allAttributes].sort(([a], [b]) => {
    const idxA = PRIORITY_ORDER.indexOf(a.toLowerCase());
    const idxB = PRIORITY_ORDER.indexOf(b.toLowerCase());
    const orderA = idxA === -1 ? 999 : idxA;
    const orderB = idxB === -1 ? 999 : idxB;
    return orderA - orderB;
  });

  // Les 5 attributs les plus importants
  const primaryAttributes = sortedByPriority.slice(0, 5);
  // Les autres attributs
  const remainingAttributes = sortedByPriority.slice(5);

  // Séparer les 5 premiers en 2 cartes façon d'avant (ex: Général et Limites / Caractéristiques)
  const card1Props = primaryAttributes.slice(0, 3);
  const card2Props = primaryAttributes.slice(3, 5);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Bouton de fermeture */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          title="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* En-tête */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Crop className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-light tracking-wide text-slate-800 dark:text-slate-100 uppercase">
                {name}
              </h2>
              <p className="text-xs text-slate-400">Détails dynamiques de l'entité sélectionnée</p>
            </div>
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-amber-950 dark:text-amber-100">Vérification Restricted</h3>
              <p className="text-xs text-amber-800 dark:text-amber-200">Analyse les espaces aériens et obstacles publiés autour du point sélectionné.</p>
            </div>
            <button type="button" onClick={onCheckRestrictions} disabled={!onCheckRestrictions || checkingRestriction} className="rounded-md bg-amber-700 px-3 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
              {checkingRestriction ? 'Vérification…' : 'Restricted'}
            </button>
          </div>
          {restriction && (
            <div className="mt-3 rounded-lg bg-white/80 p-3 text-sm text-slate-800 dark:bg-slate-900/70 dark:text-slate-100">
              <p className="font-semibold">{restriction.message}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Espaces détectés : {restriction.airspaces.length} · Obstacles : {restriction.obstacles.length} · Hauteur maximale générale : {restriction.maximumHeightMeters} m</p>
              {restriction.nearestAerodrome && <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Aérodrome le plus proche : {restriction.nearestAerodrome.name} — {Math.round(restriction.nearestAerodrome.distanceMeters).toLocaleString('fr-FR')} m.</p>}
              {restriction.nearestObstacle && <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Obstacle le plus proche : {restriction.nearestObstacle.name} — {Math.round(restriction.nearestObstacle.distanceMeters).toLocaleString('fr-FR')} m.</p>}
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700 dark:text-slate-200">{restriction.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
              {restriction.droneRequestSuggested && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={uasFormUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">Ouvrir le formulaire PDF</a>
                  <a href={`${uasFormUrl}?download=1`} className="inline-flex rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">Télécharger le formulaire</a>
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-500">Indication cartographique uniquement : vérifiez toujours les NOTAM et les exigences de l’autorité compétente.</p>
            </div>
          )}
        </section>

        {/* Cartes d'affichage des 5 attributs importants (comme avant) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Carte 1 : Informations Générales */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-slate-300 text-xs font-serif italic text-slate-600 dark:border-slate-600 dark:text-slate-300">
                i
              </span>
              <h3 className="text-base font-semibold">Informations Générales</h3>
            </div>

            <dl className="space-y-3.5 text-sm">
              <div>
                <dt className="font-semibold text-slate-900 dark:text-slate-200">Nom :</dt>
                <dd className="text-slate-600 dark:text-slate-400">{name}</dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-900 dark:text-slate-200">Type :</dt>
                <dd className="text-slate-600 dark:text-slate-400">{type}</dd>
              </div>

              {card1Props.map(([key, val]) => (
                <div key={key}>
                  <dt className="font-semibold text-slate-900 dark:text-slate-200">
                    {labelFor(key)} :
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-400">{formatValue(val)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Carte 2 : Caractéristiques & Limites */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Crop className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <h3 className="text-base font-semibold">Caractéristiques & Limites</h3>
            </div>

            <dl className="space-y-3.5 text-sm">
              {card2Props.length > 0 ? (
                card2Props.map(([key, val]) => (
                  <div key={key}>
                    <dt className="font-semibold text-slate-900 dark:text-slate-200">
                      {labelFor(key)} :
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-400">{formatValue(val)}</dd>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Aucune limite spécifique renseignée.
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Section extensible "Voir plus" pour voir tous les attributs disponibles */}
        {remainingAttributes.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowMoreProps(!showMoreProps)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
            >
              <span>
                {showMoreProps
                  ? 'Voir moins'
                  : `Voir plus (${remainingAttributes.length} autres attributs)`}
              </span>
              {showMoreProps ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showMoreProps && (
              <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-2 md:grid-cols-3">
                {remainingAttributes.map(([key, val]) => (
                  <div key={key} className="truncate">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {labelFor(key)} :{' '}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {formatValue(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
