import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const airports = [
  { name: 'Antananarivo Ivato (FMMI)', lat: -18.7969, lng: 47.4788 },
  { name: 'Nosy Be Fascene (FMNN)', lat: -13.3121, lng: 48.3148 },
  { name: 'Toamasina (FMMT)', lat: -18.1095, lng: 49.3925 },
  { name: 'Mahajanga (FMMN)', lat: -15.6671, lng: 46.3512 },
];

export default function LandingMapPreview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([-18.8, 47.3], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
    airports.forEach((airport) => L.marker([airport.lat, airport.lng], { icon: L.divIcon({ className: 'landing-airport-marker', html: '<span>✈</span>', iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(map).bindPopup(`<b>${airport.name}</b><br/>Donnée de démonstration`));
    return () => { map.remove(); };
  }, []);

  return <div ref={container} className="h-full w-full" aria-label="Carte OpenStreetMap des aéroports de Madagascar" />;
}
