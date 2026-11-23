import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '@/utils/types';
import { api } from '@/service/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, nom: string) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  isAdmin: boolean;
  isEditeur: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('user_data', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          api.clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password: string, nom: string): Promise<User> => {
    const res = await api.auth.register({ email, password, nom });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    return api.auth.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return api.auth.resetPassword(token, newPassword);
  };

  const isAdmin = user?.role === 'admin';
  const isEditeur = user?.role === 'editeur' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAdmin,
        isEditeur,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
