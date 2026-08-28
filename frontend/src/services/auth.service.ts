import api from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  tipo_admin?: 'ti' | 'general' | null;
  area?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  },

  // Solicita el enlace de restablecimiento. Responde igual exista o no la cuenta.
  async solicitarRecuperacion(email: string): Promise<string> {
    const response = await api.post('/api/auth/recuperar', { email });
    return response.data.message;
  },

  // Verifica que el enlace siga vigente; devuelve el correo enmascarado.
  async verificarTokenRecuperacion(token: string): Promise<{ email: string }> {
    const response = await api.get(`/api/auth/recuperar/${token}`);
    return response.data.data;
  },

  async restablecerPassword(token: string, password: string): Promise<string> {
    const response = await api.post('/api/auth/restablecer', { token, password });
    return response.data.message;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

