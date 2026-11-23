import type { User, LoginRequest, RegisterRequest } from '@/utils/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private enregistrerTokens(access: string, refresh?: string) {
    localStorage.setItem('access_token', access);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  }

  public clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Si le token a expiré, on tente de le renouveler
    if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`;
        response = await fetch(url, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || errorData.error?.message || `Erreur ${response.status}`;
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return response.json();
  }

  public async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.accessToken) {
        this.enregistrerTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Authentification
  auth = {
    login: async (credentials: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
      const data = await this.request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      this.enregistrerTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      return data;
    },

    register: async (dto: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
      const data = await this.request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      this.enregistrerTokens(data.accessToken, data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      return data;
    },

    logout: async () => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } finally {
        this.clearTokens();
      }
    },

    me: async (): Promise<User> => {
      return this.request<User>('/auth/me');
    },

    forgotPassword: async (email: string) => {
      return this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (token: string, newPassword: string) => {
      return this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
  };

  // Aérodromes
  aerodromes = {
    getAll: () => this.request<any[]>('/aerodromes'),
    getById: (id: string) => this.request<any>(`/aerodromes/${id}`),
    create: (data: any) => this.request<any>('/aerodromes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<any>(`/aerodromes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<any>(`/aerodromes/${id}`, { method: 'DELETE' }),
  };

  // Districts
  districts = {
    getAll: () => this.request<Array<{ id: string; district: string; region: string | null; geometry: { coordinates?: unknown } | null }>>('/districts'),
  };

  // Aéronefs
  aeronefs = {
    getAll: () => this.request<any[]>('/aeronefs'),
    getEnVol: () => this.request<any[]>('/aeronefs/en-vol'),
    getById: (id: string) => this.request<any>(`/aeronefs/${id}`),
    create: (data: any) => this.request<any>('/aeronefs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<any>(`/aeronefs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updatePosition: (id: string, coords: any) => this.request<any>(`/aeronefs/${id}/position`, { method: 'PATCH', body: JSON.stringify(coords) }),
    delete: (id: string) => this.request<any>(`/aeronefs/${id}`, { method: 'DELETE' }),
  };

  // Statistiques
  stats = {
    getDashboard: () => this.request<any>('/stats/dashboard'),
    getPublic: () => this.request<any>('/stats/public'),
  };

  // Utilisateurs (Admin)
  users = {
    getAll: () => this.request<User[]>('/users'),
    update: (id: string, data: Partial<Pick<User, 'nom' | 'email' | 'role' | 'isActive'>>) =>
      this.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
  };

  // GeoServer
  geoserver = {
    uploadShapefile: (files: File | File[], layerName?: string) => {
      const data = new FormData();
      if (Array.isArray(files)) {
        files.forEach((f) => data.append('files', f));
      } else {
        data.append('file', files);
      }
      if (layerName?.trim()) {
        data.append('layerName', layerName.trim());
      }
      return this.request<{ message: string; name: string; title: string; wmsUrl: string; wfsUrl: string }>('/geoserver/shapefiles', {
        method: 'POST',
        body: data,
      });
    },
  };
}

export const api = new ApiService();
