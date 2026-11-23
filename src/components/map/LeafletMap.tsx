import { useEffect, useRef } from 'react';
import L, { type Map as LeafletInstance } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INITIAL_MAP_VIEW, INITIAL_MAP_ZOOM } from '@/config/map';
import { getFeaturesAtPosition, getWmsFeaturesAtPosition } from '@/layers/geoserver';
import type { GeoFeature, GeoLayer, Point } from '@/layers/types';
import { formatFeaturePopup } from '@/utils/popup';
import { getLayerLegendLabel } from '@/layers/LayerIcon';
import { getAirspaceCategory } from '@/layers/airspaceCategories';

export type { GeoFeature, GeoLayer, Point } from '@/layers/types';

export type AirportMarker = {
  id: string;
  nom: string;
  code_oaci?: string | null;
  code_iata?: string | null;
  latitude: number | string;
  longitude: number | string;
};

type LeafletMapProps = {
  className?: string;
  geoserver: string;
  workspace: string;
  layers: GeoLayer[];
  airports: AirportMarker[];
  drawMode: 'line' | 'polygon' | null;
  drawPoints: Point[];
  onDrawPoint: (point: Point) => void;
  onCoordinate: (point: Point) => void;
  onFeatureSelect: (content: string, feature?: GeoFeature, point?: Point) => void;
  onOpenDetail?: (feature: GeoFeature) => void;
  onMapReady: (map: LeafletInstance) => void;
  onBaseMapChange: (baseMap: 'osm' | 'satellite') => void;
};

const WMS_PANE_NAME = 'wmsOverlayPane';

export function LeafletMap({
  className,
  geoserver,
  workspace,
  layers,
  airports,
  drawMode,
  drawPoints,
  onDrawPoint,
  onCoordinate,
  onFeatureSelect,
  onOpenDetail,
  onMapReady,
  onBaseMapChange,
}: LeafletMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletInstance | null>(null);
  const wmsLayersRef = useRef<L.LayerGroup>(L.layerGroup());
  const drawingRef = useRef<L.LayerGroup>(L.layerGroup());
  const airportsRef = useRef<L.LayerGroup>(L.layerGroup());

  const layersRef = useRef(layers);
  const drawModeRef = useRef(drawMode);
  const onDrawPointRef = useRef(onDrawPoint);
  const onCoordinateRef = useRef(onCoordinate);
  const onFeatureSelectRef = useRef(onFeatureSelect);
  const onOpenDetailRef = useRef(onOpenDetail);
  const onBaseMapChangeRef = useRef(onBaseMapChange);
  const hoverTimerRef = useRef<number | null>(null);
  const clickTimerRef = useRef<number | null>(null);
  const hoverRequestRef = useRef(0);
  const hoverTooltipRef = useRef<L.Tooltip | null>(null);

  useEffect(() => {
    layersRef.current = layers;
    drawModeRef.current = drawMode;
    onDrawPointRef.current = onDrawPoint;
    onCoordinateRef.current = onCoordinate;
    onFeatureSelectRef.current = onFeatureSelect;
    onOpenDetailRef.current = onOpenDetail;
    onBaseMapChangeRef.current = onBaseMapChange;
  });

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;

    const map = L.map(elementRef.current, { zoomControl: false }).setView(
      INITIAL_MAP_VIEW,
      INITIAL_MAP_ZOOM,
    );
    mapRef.current = map;
    map.createPane(WMS_PANE_NAME).style.zIndex = '350';

    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });
    const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Google Satellite',
    });

    openStreetMap.addTo(map);
    const baseLayersControl = L.control.layers(
      { 'OpenStreetMap Standard': openStreetMap, 'Google Satellite View': satellite },
      undefined,
      { position: 'topright' },
    ).addTo(map);
    baseLayersControl.getContainer()?.classList.add('map-base-layers-control');

    map.on('baselayerchange', (event) => {
      onBaseMapChangeRef.current(event.name === 'Google Satellite View' ? 'satellite' : 'osm');
    });

    wmsLayersRef.current.addTo(map);
    drawingRef.current.addTo(map);
    airportsRef.current.addTo(map);

    const fermerTooltip = () => {
      hoverTooltipRef.current?.remove();
      hoverTooltipRef.current = null;
    };

    map.on('mousemove', (event) => {
      onCoordinateRef.current(event.latlng);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      const requestId = ++hoverRequestRef.current;
      fermerTooltip();

      hoverTimerRef.current = window.setTimeout(async () => {
        try {
          const features = await getWmsFeaturesAtPosition(map, event.latlng, layersRef.current, geoserver, workspace);
          if (requestId !== hoverRequestRef.current) return;

          map.getContainer().style.cursor = features.length ? 'pointer' : drawModeRef.current ? 'crosshair' : 'grab';
          const featureId = features[0]?.id?.toLowerCase() ?? '';

          const coucheTrouvee = layersRef.current.find((layer) => {
            const nomCourt = layer.name.split(':').pop()?.toLowerCase() ?? layer.name.toLowerCase();
            const nomComplet = layer.name.toLowerCase();
            return (
              featureId.startsWith(`${nomCourt}.`) ||
              featureId.startsWith(`${nomCourt}:`) ||
              featureId === nomCourt ||
              featureId.startsWith(`${nomComplet}.`) ||
              featureId.startsWith(`${nomComplet}:`) ||
              featureId === nomComplet
            );
          });

          if (coucheTrouvee) {
            hoverTooltipRef.current = L.tooltip({
              direction: 'top',
              offset: [0, -12],
              opacity: 0.95,
              className: 'map-layer-tooltip',
            })
              .setLatLng(event.latlng)
              .setContent(getLayerLegendLabel(coucheTrouvee.name, coucheTrouvee.title))
              .openOn(map);
          } else {
            fermerTooltip();
          }
        } catch {
          if (requestId !== hoverRequestRef.current) return;
          map.getContainer().style.cursor = drawModeRef.current ? 'crosshair' : 'grab';
          fermerTooltip();
        }
      }, 180);
    });

    map.on('mouseout', () => {
      ++hoverRequestRef.current;
      fermerTooltip();
    });

    map.on('click', (event) => {
      // Annuler tout timer de clic précédent
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }

      if (drawModeRef.current) {
        onDrawPointRef.current(event.latlng);
        return;
      }

      // Attendre 250ms pour distinguer un simple clic d'un double-clic (zoom)
      clickTimerRef.current = window.setTimeout(async () => {
        try {
          const features = await getFeaturesAtPosition(
            map,
            event.latlng,
            layersRef.current,
            geoserver,
            workspace,
          );
          const firstFeature = features[0];

          if (firstFeature) {
            onFeatureSelectRef.current(formatFeaturePopup(features), firstFeature, event.latlng);

            const nom =
              String(
                firstFeature.properties?.name ||
                  firstFeature.properties?.nom ||
                  firstFeature.properties?.district ||
                  firstFeature.properties?.designator ||
                  firstFeature.id ||
                  'Entité',
              );

            const rawType =
              firstFeature.properties?.type ??
              firstFeature.properties?.class ??
              firstFeature.properties?.airspace_type;
            const airspaceCat = getAirspaceCategory(rawType, nom);
            const type = airspaceCat
              ? `${airspaceCat.label} (${airspaceCat.code})`
              : String(rawType || 'Zone géographique');

            const popupContainer = document.createElement('div');
            popupContainer.className = 'p-1 text-slate-800';
            popupContainer.innerHTML = `
              <div style="min-width: 170px;">
                <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
                  ${nom}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                  ${type}
                </div>
                <button
                  id="btn-leaflet-detail"
                  style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #059669; color: white; border: none; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer;"
                >
                  <span style="font-style: italic; font-family: serif; font-weight: bold; background: rgba(255,255,255,0.3); border-radius: 50%; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center;">i</span>
                  Détails complets
                </button>
              </div>
            `;

            popupContainer
              .querySelector('#btn-leaflet-detail')
              ?.addEventListener('click', () => {
                if (onOpenDetailRef.current) {
                  onOpenDetailRef.current(firstFeature);
                }
              });

            L.popup({ offset: [0, -6] })
              .setLatLng(event.latlng)
              .setContent(popupContainer)
              .openOn(map);
          } else {
            onFeatureSelectRef.current('<p class="zone-popup-empty">Aucune entité trouvée</p>');
          }
        } catch {
          onFeatureSelectRef.current('<p class="zone-popup-empty">Impossible de lire les informations WMS/WFS.</p>');
        }
      }, 250);
    });

    // En cas de double-clic (ex: pour zoomer), on annule immédiatement l'affichage des informations
    map.on('dblclick', () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    });

    onMapReady(map);

    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      fermerTooltip();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    wmsLayersRef.current.clearLayers();
    map.eachLayer((mapLayer) => {
      if (mapLayer instanceof L.TileLayer.WMS) {
        map.removeLayer(mapLayer);
      }
    });

    layers
      .filter((layer) => layer.selected && layer.visible)
      .forEach((layer) => {
        const opacity = layer.opacity / 100;
        const isDistrict = layer.name.split(':').pop()?.toLowerCase() === 'district';

        const wmsLayer = L.tileLayer.wms(`${geoserver}/${workspace}/wms`, {
          layers: layer.name,
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          ...(isDistrict ? { crs: L.CRS.EPSG4326 } : {}),
          pane: WMS_PANE_NAME,
          opacity,
          ...(layer.cqlFilter ? { cql_filter: layer.cqlFilter } : {}),
        }).addTo(wmsLayersRef.current);

        wmsLayer.setOpacity(opacity);
        wmsLayer.getContainer()?.style.setProperty('opacity', String(opacity), 'important');
      });
  }, [geoserver, layers, workspace]);

  useEffect(() => {
    const markers = airportsRef.current;
    markers.clearLayers();

    const airportIcon = L.divIcon({
      className: 'airport-map-marker',
      html: '<span aria-hidden="true">&#9992;</span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    airports.forEach((airport) => {
      const lat = Number(airport.latitude);
      const lng = Number(airport.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const code = airport.code_oaci ?? airport.code_iata;
      const titre = code ? `${airport.nom} (${code})` : airport.nom;
      const marker = L.marker([lat, lng], { icon: airportIcon, title: titre });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        const feature: GeoFeature = {
          id: `aerodrome.${airport.id}`,
          properties: {
            name: airport.nom,
            nom: airport.nom,
            type: 'Aérodrome / Infrastructure',
            icaocode: airport.code_oaci || 'NIL',
            code_oaci: airport.code_oaci || 'NIL',
            iatacode: airport.code_iata || 'NIL',
            code_iata: airport.code_iata || 'NIL',
            latitude: airport.latitude,
            longitude: airport.longitude,
            country: 'Madagascar',
            activity: 'Activité aéroportuaire',
          },
        };
        onFeatureSelectRef.current(formatFeaturePopup([feature]), feature, { lat, lng });
        if (onOpenDetailRef.current) {
          onOpenDetailRef.current(feature);
        }
      });

      marker.addTo(markers);
    });
  }, [airports]);

  // Met à jour le curseur via l'API Leaflet (sans modifier le className du div)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = drawMode ? 'crosshair' : '';
    // Recalcule la taille pour éviter tout décalage lors du changement de mode
    map.invalidateSize();
  }, [drawMode]);

  useEffect(() => {
    drawingRef.current.clearLayers();
    if (!drawPoints.length) return;

    const points = drawPoints.map((point) => [point.lat, point.lng] as L.LatLngTuple);
    const drawingStyle = { color: '#059669', fillColor: '#10b981', fillOpacity: 0.2 };

    if (drawMode === 'polygon' && points.length > 2) {
      L.polygon(points, drawingStyle).addTo(drawingRef.current);
    } else {
      L.polyline(points, { color: '#059669', weight: 3 }).addTo(drawingRef.current);
    }

    points.forEach((point) => {
      L.circleMarker(point, { radius: 5, color: '#059669', fillOpacity: 1 }).addTo(drawingRef.current);
    });
  }, [drawMode, drawPoints]);

  return (
    <div
      ref={elementRef}
      className={className ?? 'h-full w-full'}
    />
  );
}
