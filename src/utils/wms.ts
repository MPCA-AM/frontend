import type { GeoLayer } from '@/layers/types';

const COUCHES_PAR_DEFAUT = [
  { name: 'Aviation:teste', title: 'Aéroports', opacity: 100 },
  { name: 'Aviation:district', title: 'Districts', opacity: 20 },
  { name: 'Aviation:airspace', title: 'Espaces aériens', opacity: 70 },
];

function extraireNom(nom: string): string {
  const parties = nom.split(':');
  return parties[parties.length - 1].toLowerCase();
}

function trouverCoucheDefaut(nom: string) {
  return COUCHES_PAR_DEFAUT.find((c) => extraireNom(c.name) === extraireNom(nom));
}

export function parseWmsLayers(xml: string): GeoLayer[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  const couches: GeoLayer[] = [];
  const noeuds = Array.from(xmlDoc.querySelectorAll('Layer'));

  for (const noeud of noeuds) {
    const enfants = Array.from(noeud.children);
    const nomElem = enfants.find((c) => c.localName === 'Name');
    const titreElem = enfants.find((c) => c.localName === 'Title');

    const name = nomElem?.textContent?.trim();
    const rawTitle = titreElem?.textContent?.trim();

    if (!name || !rawTitle) continue;

    const existeDeja = couches.some((c) => extraireNom(c.name) === extraireNom(name));
    if (existeDeja) continue;

    const estAeroport = extraireNom(name) === 'teste';
    const title = estAeroport ? 'Aéroports' : rawTitle;

    const config = trouverCoucheDefaut(name);

    couches.push({
      name,
      title,
      selected: false,
      visible: false,
      opacity: config ? config.opacity : 100,
    });
  }

  // Ajouter les couches par défaut si absentes du XML
  for (let i = COUCHES_PAR_DEFAUT.length - 1; i >= 0; i--) {
    const def = COUCHES_PAR_DEFAUT[i];
    const trouve = couches.some((c) => extraireNom(c.name) === extraireNom(def.name));
    if (!trouve) {
      couches.unshift({
        name: def.name,
        title: def.title,
        selected: false,
        visible: false,
        opacity: def.opacity,
      });
    }
  }

  return couches;
}
