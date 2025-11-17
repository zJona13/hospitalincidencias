import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token y usuario guardado
    const token = authService.getToken();
    const savedUser = authService.getUser();

    if (token && savedUser) {
      // Verificar token con el servidor
      authService
        .getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          authService.setUser(currentUser);
        })
        .catch((error) => {
          // Token inválido o error de conexión, limpiar
          console.error('Error al verificar usuario:', error);
          authService.logout();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setToken(response.token);
      authService.setUser(response.user);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Usar window.location en lugar de navigate porque estamos fuera del Router
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

