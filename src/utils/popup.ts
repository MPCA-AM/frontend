import type { GeoFeature } from '@/layers/types';

const CHAMPS_IMPORTANTS = [
  'name', 'nom', 'icaocode', 'code_oaci', 'icao', 'iatacode', 'code_iata', 'iata',
  'type', 'elevation', 'country', 'district', 'region', 'upper valu', 'lower valu'
];

const MAX_ENTITES = 3;

function echapperHtml(texte: unknown): string {
  const str = String(texte ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatFeaturePopup(features: GeoFeature[]): string {
  if (!features || features.length === 0) {
    return `
      <div class="leaflet-popup-content-body">
        <p class="zone-popup-empty">Aucune entité trouvée</p>
      </div>
    `;
  }

  // Filtrer les doublons
  const vus = new Set<string>();
  const uniques: GeoFeature[] = [];

  for (const f of features) {
    const cle = f.id ? String(f.id) : JSON.stringify(f.properties);
    if (!vus.has(cle)) {
      vus.add(cle);
      uniques.push(f);
    }
  }

  const selection = uniques.slice(0, MAX_ENTITES);

  const blocsHtml = selection.map((feature) => {
    const props = feature.properties || {};
    const entrees = Object.entries(props).filter(([cle, val]) => {
      if (val === null || val === '') return false;
      const ignore = /^(geom|geometry|the_geom|id|fid|objectid|___id)$/i;
      return !ignore.test(cle);
    });

    const champsUtiles = entrees.filter(([cle]) => CHAMPS_IMPORTANTS.includes(cle.toLowerCase()));
    const champsAAfficher = champsUtiles.length > 0 ? champsUtiles : entrees.slice(0, 5);

    if (champsAAfficher.length === 0) return '';

    const lignes = champsAAfficher.map(([cle, val]) => {
      const label = echapperHtml(cle.replace(/_/g, ' '));
      const valeur = echapperHtml(val);
      return `
        <div class="zone-popup-row">
          <dt>${label}</dt>
          <dd>${valeur}</dd>
        </div>
      `;
    }).join('');

    return `<dl>${lignes}</dl>`;
  }).join('');

  return `
    <div class="leaflet-popup-content-body">
      <div class="zone-popup-fields">
        ${blocsHtml}
      </div>
    </div>
  `;
}
