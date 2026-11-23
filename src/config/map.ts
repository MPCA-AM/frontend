// -----------------------------------------------------------------------------
// Environment helpers
// -----------------------------------------------------------------------------

function getNumberEnvironmentVariable(key: string, fallback: number) {
  // Les variables Vite sont toujours des chaînes. Number() les convertit avant
  // de les transmettre à Leaflet, qui attend des nombres pour lat/lng/zoom.
  const value = Number(import.meta.env[key]);

  // Une variable absente ou invalide ne doit pas empêcher l'affichage de la carte.
  return Number.isFinite(value) ? value : fallback;
}

// -----------------------------------------------------------------------------
// Map and GeoServer configuration
// -----------------------------------------------------------------------------

/**
 * URL de base appelée par le navigateur pour les requêtes WMS/WFS.
 * Avec `/geoserver`, Vite applique le proxy défini dans vite.config.ts.
 */
export const GEOSERVER_URL = (import.meta.env.VITE_GEOSERVER_URL || '/geoserver').replace(/\/$/, '');

/** GeoServer workspace that supplies the dynamic layer catalogue. */
export const GEOSERVER_WORKSPACE = import.meta.env.VITE_GEOSERVER_WORKSPACE || 'Aviation';

/** Initial Leaflet map view, configured in the .env file. */
export const INITIAL_MAP_VIEW: [number, number] = [
  getNumberEnvironmentVariable('VITE_INITIAL_MAP_LAT', -18.8792),
  getNumberEnvironmentVariable('VITE_INITIAL_MAP_LNG', 47.5079),
];

export const INITIAL_MAP_ZOOM = getNumberEnvironmentVariable('VITE_INITIAL_MAP_ZOOM', 6);
