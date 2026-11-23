/* ─────────────────────────────────────────────────────────────────────────
   MADAGASCAR AVIATION CARTOGRAPHIC PORTAL — Shared TypeScript Types
   ───────────────────────────────────────────────────────────────────────── */

// ─── User & Auth ──────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editeur' | 'utilisateur';

export interface User {
  id: string;
  email: string;
  nom: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Aircraft ─────────────────────────────────────────────────────────────

export type AircraftStatut = 'actif' | 'inactif' | 'entretien';

export interface Aircraft {
  id: string;
  immatriculation: string;
  type: string;
  compagnie: string;
  statut: AircraftStatut;
  latitude: number;
  longitude: number;
  altitude: number;
  vitesse: number;
  cap: number;
  updatedAt: string;
}

export interface CreateAircraftRequest {
  immatriculation: string;
  type: string;
  compagnie: string;
  statut: AircraftStatut;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  vitesse?: number;
  cap?: number;
}

export type UpdateAircraftRequest = Partial<CreateAircraftRequest>;

// ─── Piste (Runway) ────────────────────────────────────────────────────────

export type RevetementType = 'bitume' | 'beton' | 'gravier' | 'herbe' | 'terre';

export interface Piste {
  id: string;
  longueur: number;      // metres
  largeur: number;       // metres
  orientation: string;  // e.g. "13/31"
  revetement: RevetementType;
}

export interface CreatePisteRequest {
  longueur: number;
  largeur: number;
  orientation: string;
  revetement: RevetementType;
}

// ─── Aerodrome ─────────────────────────────────────────────────────────────

export type AerodromeType = 'aeroport' | 'aerodrome' | 'heliport' | 'ULM';

export interface Aerodrome {
  id: string;
  nom: string;
  code_oaci: string;
  latitude: number;
  longitude: number;
  type: AerodromeType;
  region: string;
  pistes: Piste[];
}

export interface CreateAerodromeRequest {
  nom: string;
  code_oaci: string;
  latitude: number;
  longitude: number;
  type: AerodromeType;
  region: string;
  pistes?: CreatePisteRequest[];
}

export type UpdateAerodromeRequest = Partial<CreateAerodromeRequest>;

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export interface AircraftStats {
  total: number;
  actif: number;
  inactif: number;
  entretien: number;
}

export interface AerodromeStats {
  total: number;
  parType: Record<AerodromeType, number>;
  parRegion: Record<string, number>;
}

export interface UserStats {
  total: number;
  admins: number;
  editeurs: number;
  utilisateurs: number;
}

export interface TrafficDataPoint {
  date: string;
  mouvements: number;
  vols_commerciaux: number;
  vols_prives: number;
}

export interface Stats {
  aircraft: AircraftStats;
  aerodromes: AerodromeStats;
  users: UserStats;
  trafficTrend: TrafficDataPoint[];
}

// ─── API Helpers ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ─── UI Helpers ────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}
