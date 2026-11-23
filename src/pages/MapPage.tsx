import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Expand, Layers, LogIn, LogOut, MapPin, Minus, Plane, Plus, RotateCcw, Search, X } from 'lucide-react';
import type { Map as LeafletInstance } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/service/api';
import { DrawingControls } from '@/components/map/DrawingControls';
import { LeafletMap, type Point } from '@/components/map/LeafletMap';
import { MapLayersSheet } from '@/components/map/MapLayersSheet';
import { MapCatalog } from '@/components/map/MapCatalog';
import { AirspaceDetailModal, convertFeatureToAirspaceDetail } from '@/components/map/AirspaceDetailModal';
import { MapFloatingLegend } from '@/components/map/MapFloatingLegend';
import { MapScale } from '@/components/map/MapScale';
import type { GeoFeature } from '@/layers/types';
import { GEOSERVER_URL, GEOSERVER_WORKSPACE, INITIAL_MAP_VIEW, INITIAL_MAP_ZOOM } from '@/config/map';
import { useGeoServerLayers } from '@/hooks/useGeoServerLayers';
import { ModeToggle } from '@/components/mode-toggle';
import { getOperationalRestrictionsAtPosition, type RestrictionAssessment } from '@/layers/geoserver';

type Airport = {
  id: string;
  nom: string;
  code_oaci?: string | null;
  code_iata?: string | null;
  latitude: number | string;
  longitude: number | string;
};

type District = {
  id: string;
  name: string;
  region?: string;
  bounds: [[number, number], [number, number]];
};

function getDistrictLabel(district: District) {
  if (district.region) {
    return `${district.name} — ${district.region}`;
  }
  return district.name;
}

function getDistrictBounds(coordinates: unknown): District['bounds'] | null {
  const points: [number, number][] = [];

  const extrairePoints = (val: unknown) => {
    if (!Array.isArray(val)) return;
    if (typeof val[0] === 'number' && typeof val[1] === 'number') {
      points.push([val[0], val[1]]);
      return;
    }
    val.forEach(extrairePoints);
  };

  extrairePoints(coordinates);

  if (points.length === 0) return null;

  const lats = points.map((p) => p[1]);
  const lngs = points.map((p) => p[0]);

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

export default function MapPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<LeafletInstance | null>(null);
  const { layers, setLayers, status, reload: loadLayers } = useGeoServerLayers(GEOSERVER_URL, GEOSERVER_WORKSPACE);

  const [isLayersOpen, setLayersOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null);
  const [query, setQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [drawMode, setDrawMode] = useState<'line' | 'polygon' | null>(null);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);
  const [selectedFeatureInfo, setSelectedFeatureInfo] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [restriction, setRestriction] = useState<RestrictionAssessment | null>(null);
  const [checkingRestriction, setCheckingRestriction] = useState(false);

  const checkRestrictions = async () => {
    if (!selectedPoint) return;
    setCheckingRestriction(true);
    try {
      setRestriction(await getOperationalRestrictionsAtPosition(selectedPoint, GEOSERVER_URL, GEOSERVER_WORKSPACE));
    } catch {
      setRestriction({ airspaces: [], obstacles: [], aerodromes: [], status: 'caution', maximumHeightMeters: 120, droneRequestSuggested: true, message: 'Impossible de vérifier les contraintes publiées pour ce point. Consultez les sources officielles avant tout vol.', conditions: ['Aucune décision de vol ne doit être prise tant que les NOTAM et règles applicables ne sont pas vérifiés.'] });
    } finally {
      setCheckingRestriction(false);
    }
  };

  useEffect(() => {
    api.aerodromes.getAll()
      .then((data) => setAirports(data))
      .catch(() => setAirports([]));
  }, []);

  useEffect(() => {
    api.districts.getAll()
      .then((items) => {
        const liste: District[] = [];
        for (const item of items) {
          const bounds = getDistrictBounds(item.geometry?.coordinates);
          if (bounds) {
            liste.push({
              id: item.id,
              name: item.district,
              region: item.region ?? undefined,
              bounds,
            });
          }
        }
        liste.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        setDistricts(liste);
      })
      .catch(() => setDistricts([]));
  }, []);

  const selectedLayers = useMemo(() => {
    return layers.filter((layer) => layer.selected);
  }, [layers]);

  const filteredLayers = useMemo(() => {
    const motCle = query.trim().toLowerCase();
    return selectedLayers.filter((layer) => layer.title.toLowerCase().includes(motCle));
  }, [selectedLayers, query]);

  // Couches dont la légende SLD est cochée pour affichage sur la carte
  const [legendLayerNames, setLegendLayerNames] = useState<string[]>([

  ]);

  const toggleLegendLayer = (layerName: string) => {
    setLegendLayerNames((prev) =>
      prev.includes(layerName)
        ? prev.filter((name) => name !== layerName)
        : [...prev, layerName],
    );
  };

  const legendLayers = useMemo(() => {
    return layers.filter((layer) => legendLayerNames.includes(layer.name));
  }, [layers, legendLayerNames]);

  const selectDistrict = (id: string) => {
    const district = districts.find((item) => item.id === id);
    if (!district || !map) return;
    setSelectedDistrict(id);

    setLayers((items) =>
      items.map((item) => {
        const nomSimple = item.name.split(':').pop()?.toLowerCase();
        return nomSimple === 'district' ? { ...item, opacity: 20 } : item;
      })
    );
    map.fitBounds(district.bounds, { padding: [42, 42], maxZoom: 10 });
  };

  const resetView = () => {
    setSelectedDistrict(null);
    setLayers((items) =>
      items.map((item) => {
        const nomSimple = item.name.split(':').pop()?.toLowerCase() ?? '';
        const opacite = nomSimple === 'district' || nomSimple === 'airspace' ? 20 : 100;
        return { ...item, opacity: opacite };
      })
    );
    if (map) {
      map.setView(INITIAL_MAP_VIEW, INITIAL_MAP_ZOOM);
    }
  };

  const toggleFullscreen = () => {
    const target = pageRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.requestFullscreen();
    }
  };

  // Recalcule la carte après entrée/sortie du plein écran
  useEffect(() => {
    const onFsChange = () => {
      setTimeout(() => map?.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [map]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timer);
  }, [map, selectedFeatureInfo, isLayersOpen]);

  return (
    <div ref={pageRef} className="flex h-dvh flex-col overflow-hidden bg-slate-100 p-[5px] dark:bg-slate-950">
      {/* Barre d'en-tête */}
      <header className="z-20 flex h-16 shrink-0 items-center justify-between rounded-[20px] border border-emerald-200 bg-white px-4 text-emerald-950 shadow-lg shadow-emerald-950/10 dark:border-emerald-800 dark:bg-emerald-950 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-emerald-950 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Plane className="h-5 w-5 rotate-45" />
          </span>
          <span className="text-base font-bold sm:text-lg">
            Avia<span className="text-emerald-600">Mada</span>
          </span>
          <span className="hidden border-l border-emerald-200 pl-2 text-xs font-medium text-emerald-700 sm:inline">
            Géoportail aéronautique
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {/* Menu déroulant des districts */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 max-w-52 items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-50">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate">
                {selectedDistrict
                  ? getDistrictLabel(districts.find((d) => d.id === selectedDistrict)!)
                  : 'Sélectionner un district'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Districts</DropdownMenuLabel>
                {districts.map((district) => (
                  <DropdownMenuItem
                    key={district.id}
                    onClick={() => selectDistrict(district.id)}
                    className="cursor-pointer py-2"
                  >
                    <MapPin className="text-emerald-600" />
                    <span>{getDistrictLabel(district)}</span>
                  </DropdownMenuItem>
                ))}
                {districts.length === 0 && (
                  <DropdownMenuItem disabled>Aucun district disponible</DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-emerald-800 dark:text-emerald-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-900"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Se connecter</span>
            </Link>
          )}
        </nav>
      </header>

      {/* Zone de la carte principale */}
      <main className="relative isolate z-0 mt-[5px] min-h-0 flex-1 overflow-hidden rounded-[20px]">
        {/* Volet latéral gauche des couches (balayage gauche -> droite, style Image 2) */}
        <MapLayersSheet
          open={isLayersOpen}
          onOpenChange={setLayersOpen}
          layers={selectedLayers}
          filteredLayers={filteredLayers}
          status={status}
          geoserver={GEOSERVER_URL}
          workspace={GEOSERVER_WORKSPACE}
          onRetry={loadLayers}
          onLayersChange={setLayers}
          legendLayerNames={legendLayerNames}
          onToggleLegendLayer={toggleLegendLayer}
        />

        <div className="h-full w-full">
          <LeafletMap
            geoserver={GEOSERVER_URL}
            workspace={GEOSERVER_WORKSPACE}
            layers={layers}
            airports={airports}
            drawMode={drawMode}
            drawPoints={drawPoints}
            onDrawPoint={(point) => setDrawPoints((prev) => [...prev, point])}
            onCoordinate={setCursorPosition}
            onFeatureSelect={(content, feature, point) => {
              setSelectedFeatureInfo(content);
              if (feature) setSelectedFeature(feature);
              if (point) {
                setSelectedPoint(point);
                setRestriction(null);
              }
            }}
            onOpenDetail={(feature) => {
              setSelectedFeature(feature);
              setIsDetailsOpen(true);
            }}
            onMapReady={setMap}
            onBaseMapChange={() => undefined}
          />
        </div>

        {/* Volet d'informations à gauche (en superposition, sans décaler la carte) */}
        {selectedFeatureInfo && (
          <aside
            className="absolute inset-y-0 left-0 z-[800] flex w-[400px] max-w-[calc(100%-3rem)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950 animate-in slide-in-from-left duration-200"
            aria-label="Informations de la zone sélectionnée"
          >
            <div className="flex min-h-16 items-center justify-between bg-[#0f3b61] px-5 text-white">
              <p className="text-sm font-bold">Informations à cet emplacement</p>
              <div className="flex items-center gap-1.5">
                {selectedFeature && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDetailsOpen(true)}
                    title="Voir les détails complets (comme l'image 1)"
                    className="h-8 gap-1.5 px-2.5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[10px] font-serif italic text-[#0f3b61]">
                      i
                    </span>
                    Détails
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedFeatureInfo(null)}
                  title="Fermer le panneau"
                  className="text-white hover:bg-white/15 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950"
              dangerouslySetInnerHTML={{ __html: selectedFeatureInfo }}
            />
          </aside>
        )}

        {/* Titre en haut à gauche */}
        <div className="absolute left-4 top-4 z-[500] rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-lg">
          <p className="text-sm font-bold text-slate-900">Géoportail Aviation</p>
        </div>

        {/* Bouton du catalogue de couches */}
        <div className="absolute right-4 top-4 z-[1000]">
          <MapCatalog layers={layers} status={status} onReload={loadLayers} onLayersChange={setLayers} />
        </div>

        {/* Barre d'outils carte */}
        <div className="absolute left-4 top-20 z-[500] flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 p-2 shadow-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (selectedFeatureInfo) setSelectedFeatureInfo(null);
              setLayersOpen((prev) => !prev);
            }}
            className={isLayersOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : ''}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Couches</span>
          </Button>

          <div className="relative w-48 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une couche sur la carte"
              className="h-9 bg-white pl-9"
            />
          </div>

          <Button size="icon-sm" variant="outline" title="Vue initiale" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button size="icon-sm" variant="outline" title="Plein écran" onClick={toggleFullscreen}>
            <Expand className="h-4 w-4" />
          </Button>
        </div>

        {/* Outils de mesure et dessin */}
        <DrawingControls
          mode={drawMode}
          canDraw={Boolean(user)}
          points={drawPoints}
          onModeChange={(mode) => {
            setDrawMode(mode);
            setDrawPoints([]);
          }}
          onClear={() => {
            setDrawPoints([]);
            setDrawMode(null);
          }}
        />

        {/* Contrôles de zoom */}
        <div className="absolute right-4 top-[100px] z-[500] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <Button variant="ghost" size="icon" className="rounded-none" onClick={() => map?.zoomIn()}>
            <Plus className="h-4 w-4" />
          </Button>
          <div className="mx-2 border-t border-slate-200" />
          <Button variant="ghost" size="icon" className="rounded-none" onClick={() => map?.zoomOut()}>
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Bloc en bas à gauche : Échelle cartographique indépendante au-dessus des coordonnées GPS */}
        <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-1.5 items-start">
          <MapScale map={map} />

          <div className="rounded-lg border border-emerald-300 bg-emerald-950/95 px-3 py-2 font-mono text-[11px] font-semibold text-emerald-50 shadow-lg">
            {cursorPosition
              ? `Lat ${cursorPosition.lat.toFixed(5)} · Long ${cursorPosition.lng.toFixed(5)}`
              : 'Lat — · Long —'}
          </div>
        </div>

        {/* Légende flottante sur la carte avec les styles SLD réels de GeoServer :
            - Affiche uniquement les légendes des couches cochées dans la gestion des couches
            - Apparaît quand la gestion des couches est masquée
            - Disparaît quand la gestion des couches est affichée
        */}
        {!isLayersOpen && (
          <MapFloatingLegend
            geoserver={GEOSERVER_URL}
            workspace={GEOSERVER_WORKSPACE}
            legendLayers={legendLayers}
          />
        )}
      </main>

      {/* Fenêtre modale des détails dynamiques (comme l'image 1) */}
      <AirspaceDetailModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        data={convertFeatureToAirspaceDetail(selectedFeature)}
        restriction={restriction}
        checkingRestriction={checkingRestriction}
        onCheckRestrictions={selectedPoint ? checkRestrictions : undefined}
      />
    </div>
  );
}
