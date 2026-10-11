
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  register: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem("demo-user");
    return savedUser ? JSON.parse(savedUser) as User : null;
  });

  const login = (email: string) => {
    const currentUser = { email };
    sessionStorage.setItem("demo-user", JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const register = (email: string) => {
    login(email);
  };

  const logout = () => {
    sessionStorage.removeItem("demo-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}
