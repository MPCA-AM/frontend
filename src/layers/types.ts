export type GeoLayer = {
  name: string;
  title: string;
  selected: boolean;
  visible: boolean;
  opacity: number;
  cqlFilter?: string;
  activeSubtypes?: string[];
};

export type Point = { lat: number; lng: number };

export type GeoFeature = { id?: string; properties?: Record<string, unknown> };
