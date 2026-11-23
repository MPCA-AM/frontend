import L, { type Map as LeafletMap } from 'leaflet';
import type { GeoFeature, GeoLayer } from '@/layers/types';

export type RestrictionAssessment = {
  airspaces: GeoFeature[];
  obstacles: GeoFeature[];
  aerodromes: GeoFeature[];
  nearestAerodrome?: { name: string; distanceMeters: number };
  nearestObstacle?: { name: string; distanceMeters: number };
  status: 'allowed-with-conditions' | 'caution' | 'authorization-required' | 'prohibited';
  maximumHeightMeters: number;
  message: string;
  droneRequestSuggested: boolean;
  conditions: string[];
};

/**
 * Vérifie les données opérationnelles publiées par GeoServer autour du point.
 * Ce résultat informe l'utilisateur; il ne remplace jamais une autorisation ATS/ACM.
 */
export async function getOperationalRestrictionsAtPosition(
  position: { lat: number; lng: number },
  geoserver: string,
  workspace: string,
): Promise<RestrictionAssessment> {
  const queryLayer = async (typeName: string, radiusDegrees = 0.0005) => {
    const params = new URLSearchParams({
      service: 'WFS', version: '1.1.0', request: 'GetFeature', typeName,
      outputFormat: 'application/json', srsName: 'EPSG:4326',
      bbox: `${position.lng - radiusDegrees},${position.lat - radiusDegrees},${position.lng + radiusDegrees},${position.lat + radiusDegrees},EPSG:4326`,
      maxFeatures: '20',
    });
    const response = await fetch(`${geoserver}/${workspace}/ows?${params}`);
    if (!response.ok) return [] as GeoFeature[];
    const data = await response.json().catch(() => ({ features: [] }));
    return (data.features || []) as GeoFeature[];
  };

  const [airspaces, obstacles, aerodromes, airports] = await Promise.all([
    queryLayer(`${workspace}:mg_espace_aerienne`),
    queryLayer(`${workspace}:mg_obstacle`, 0.01),
    queryLayer(`${workspace}:aerodrome2`),
    queryLayer(`${workspace}:mg_airport`, 0.1),
  ]);
  const earthRadiusMeters = 6_371_000;
  const distanceMeters = (lat: number, lng: number) => {
    const radians = Math.PI / 180;
    const latitudeDelta = (lat - position.lat) * radians;
    const longitudeDelta = (lng - position.lng) * radians;
    const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(position.lat * radians) * Math.cos(lat * radians) * Math.sin(longitudeDelta / 2) ** 2;
    return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
  };
  const pointDistance = (feature: GeoFeature) => {
    const coordinates = (feature as GeoFeature & { geometry?: { coordinates?: unknown } }).geometry?.coordinates;
    if (!Array.isArray(coordinates) || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') return null;
    return distanceMeters(coordinates[1], coordinates[0]);
  };
  const nearestAerodrome = airports
    .map((feature) => {
      const coordinates = (feature as GeoFeature & { geometry?: { coordinates?: unknown } }).geometry?.coordinates;
      if (!Array.isArray(coordinates) || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') return null;
      return { name: String(feature.properties?.name || feature.properties?.icaocode || 'Aérodrome'), distanceMeters: distanceMeters(coordinates[1], coordinates[0]) };
    })
    .filter((item): item is { name: string; distanceMeters: number } => item !== null)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  const nearestObstacle = obstacles
    .map((feature) => {
      const distance = pointDistance(feature);
      if (distance === null) return null;
      return { name: String(feature.properties?.name || 'Obstacle'), distanceMeters: distance };
    })
    .filter((item): item is { name: string; distanceMeters: number } => item !== null)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  const types = airspaces.map((feature: GeoFeature) => Number(feature.properties?.type));
  const hasProhibited = types.includes(3);
  const hasAuthorizationZone = types.some((type: number) => [1, 4, 7].includes(type));
  const hasDanger = types.includes(2);
  const inAerodrome = aerodromes.length > 0;
  const withinFourKmAerodromeNotificationZone = (nearestAerodrome?.distanceMeters ?? Infinity) < 4_000;
  const withinObstacleProximity = (nearestObstacle?.distanceMeters ?? Infinity) < 50;
  const base = { airspaces, obstacles, aerodromes, nearestAerodrome, nearestObstacle, maximumHeightMeters: 120 };

  if (hasProhibited || inAerodrome) return { ...base, status: 'prohibited', droneRequestSuggested: false, message: 'Vol de drone non autorise : zone interdite ou emprise d aerodrome.', conditions: ['Aucun formulaire n est propose : ne pas decoller a ce point.'] };
  if (hasAuthorizationZone) return { ...base, status: 'authorization-required', droneRequestSuggested: true, message: 'Autorisation prealable requise avant le vol de drone a ce point.', conditions: ['Espace aerien reglemente ou controle detecte.', 'Dans une CTR civile, ne pas depasser 50 m sans autorisation ; une CTR militaire est interdite.', 'Le formulaire de demande est disponible ci-dessous.'] };
  if (hasDanger || withinObstacleProximity) return { ...base, status: 'caution', droneRequestSuggested: false, message: 'Obstacle ou zone dangereuse a proximite : le point exige une analyse de securite avant le vol.', conditions: [nearestObstacle ? `Obstacle le plus proche : ${nearestObstacle.name} a ${Math.round(nearestObstacle.distanceMeters).toLocaleString('fr-FR')} m.` : 'Zone dangereuse detectee.', 'Le RAM ne fixe pas de rayon general d interdiction autour de chaque obstacle. Les 50 m sont un seuil d alerte de proximite, pas une autorisation.', 'Conserver une hauteur maximale de 120 m et ne pas voler de nuit sans autorisation exceptionnelle.'] };
  if (withinFourKmAerodromeNotificationZone) return { ...base, status: 'allowed-with-conditions', droneRequestSuggested: false, message: 'Vol possible sous conditions a proximite d un aerodrome.', conditions: [nearestAerodrome ? `Aerodrome le plus proche : ${nearestAerodrome.name} a ${Math.round(nearestAerodrome.distanceMeters).toLocaleString('fr-FR')} m du point de reference.` : 'Aerodrome detecte.', 'Au-dela de 120 m dans les 4 km de la limite d un aerodrome, notifier l ACM au moins 24 h avant pour emission de NOTAM.', 'La carte calcule la distance depuis le point de reference de l aerodrome ; verifier la limite officielle, la CTR et les NOTAM.'] };
  return { ...base, status: 'allowed-with-conditions', droneRequestSuggested: false, message: 'Aucune restriction cartographiée n’a été trouvée à ce point. Le vol reste autorisé sous conditions.', conditions: ['Hauteur maximale : 120 m au-dessus du sol ou de l’eau.', 'Vol de jour, en vue directe, avec respect des tiers et de la zone de sécurité au sol.', 'Cette vérification ne couvre pas automatiquement les NOTAM, rassemblements, zones protégées ni les restrictions temporaires.'] };
}

export async function getWmsFeaturesAtPosition(
  map: LeafletMap,
  position: L.LatLng,
  layers: GeoLayer[],
  geoserver: string,
  workspace: string
): Promise<GeoFeature[]> {
  const activeLayers = layers.filter((layer) => layer.selected && layer.visible);
  if (activeLayers.length === 0) return [];

  const bounds = map.getBounds();
  const northWest = L.CRS.EPSG3857.project(bounds.getNorthWest());
  const southEast = L.CRS.EPSG3857.project(bounds.getSouthEast());
  const size = map.getSize();
  const point = map.latLngToContainerPoint(position);
  const names = activeLayers.map((layer) => layer.name).join(',');

  const query = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    layers: names,
    query_layers: names,
    styles: '',
    bbox: `${northWest.x},${southEast.y},${southEast.x},${northWest.y}`,
    width: String(size.x),
    height: String(size.y),
    srs: 'EPSG:3857',
    x: String(Math.round(point.x)),
    y: String(Math.round(point.y)),
    info_format: 'application/json',
    feature_count: '10',
    ...(activeLayers.some((l) => l.cqlFilter)
      ? { cql_filter: activeLayers.map((l) => l.cqlFilter || 'INCLUDE').join(';') }
      : {}),
  });

  const response = await fetch(`${geoserver}/${workspace}/wms?${query}`);
  if (!response.ok) return [];

  try {
    const data = await response.json();
    return data.features || [];
  } catch {
    return [];
  }
}

export async function getFeaturesAtPosition(
  map: LeafletMap,
  position: L.LatLng,
  layers: GeoLayer[],
  geoserver: string,
  workspace: string
): Promise<GeoFeature[]> {
  const activeLayers = layers.filter((layer) => layer.selected && layer.visible);
  const wmsFeatures = await getWmsFeaturesAtPosition(map, position, layers, geoserver, workspace);

  const wfsPromises = activeLayers.map(async (layer) => {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: layer.name,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
      bbox: `${position.lng - 0.0002},${position.lat - 0.0002},${position.lng + 0.0002},${position.lat + 0.0002},EPSG:4326`,
      maxFeatures: '5',
      ...(layer.cqlFilter ? { cql_filter: layer.cqlFilter } : {}),
    });

    const response = await fetch(`${geoserver}/${workspace}/ows?${params}`);
    if (!response.ok) return [];
    try {
      const data = await response.json();
      return data.features || [];
    } catch {
      return [];
    }
  });

  const wfsResults = await Promise.all(wfsPromises);
  const allWfs = wfsResults.flat();

  return [...wmsFeatures, ...allWfs];
}
