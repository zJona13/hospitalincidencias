import api from '@/lib/api';

// Usuarios
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
  area?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
}

export interface CrearUsuarioData {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  area_id?: number;
}

// Áreas
export interface Area {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
  responsable?: {
    id: number;
    nombre: string;
  } | null;
  servicios: number;
}

export interface CrearAreaData {
  codigo: string;
  nombre: string;
  responsable_id?: number;
}

// Prioridades
export interface Prioridad {
  id: number;
  nivel: string;
  nombre: string;
  color: string;
  tiempo_respuesta_minutos: number;
  tiempo_resolucion_horas: number;
  activo: boolean;
}

export interface CrearPrioridadData {
  nivel: string;
  nombre: string;
  color: string;
  tiempo_respuesta_minutos: number;
  tiempo_resolucion_horas: number;
}

// Tipos
export interface Tipo {
  id: number;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
  activo: boolean;
}

export interface CrearTipoData {
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
}

export const adminService = {
  // Usuarios
  usuarios: {
    async listar(search?: string, areaId?: number, rol?: string, activo?: boolean): Promise<Usuario[]> {
      const params: any = {};
      if (search) params.search = search;
      if (areaId) params.area_id = areaId;
      if (rol) params.rol = rol;
      if (activo !== undefined) params.activo = activo;
      const response = await api.get('/admin/usuarios', { params });
      return response.data.data;
    },
    async obtener(id: number): Promise<Usuario> {
      const response = await api.get(`/admin/usuarios/${id}`);
      return response.data.data;
    },
    async crear(data: CrearUsuarioData): Promise<Usuario> {
      const response = await api.post('/admin/usuarios', data);
      return response.data.data;
    },
    async actualizar(id: number, data: Partial<CrearUsuarioData>): Promise<void> {
      await api.put(`/admin/usuarios/${id}`, data);
    },
    async cambiarPassword(id: number, password: string): Promise<void> {
      await api.patch(`/admin/usuarios/${id}/password`, { password });
    },
    async eliminar(id: number): Promise<void> {
      await api.delete(`/admin/usuarios/${id}`);
    },
  },

  // Áreas
  areas: {
    async listar(activo?: boolean, search?: string): Promise<Area[]> {
      const params: any = {};
      if (activo !== undefined) params.activo = activo;
      if (search) params.search = search;
      const response = await api.get('/admin/areas', { params });
      return response.data.data;
    },
    async obtener(id: number): Promise<Area> {
      const response = await api.get(`/admin/areas/${id}`);
      return response.data.data;
    },
    async crear(data: CrearAreaData): Promise<Area> {
      const response = await api.post('/admin/areas', data);
      return response.data.data;
    },
    async actualizar(id: number, data: Partial<CrearAreaData & { activo?: boolean }>): Promise<void> {
      await api.put(`/admin/areas/${id}`, data);
    },
    async eliminar(id: number): Promise<void> {
      await api.delete(`/admin/areas/${id}`);
    },
  },

  // Prioridades
  prioridades: {
    async listar(activo?: boolean): Promise<Prioridad[]> {
      const params: any = {};
      if (activo !== undefined) params.activo = activo;
      const response = await api.get('/admin/prioridades', { params });
      return response.data.data;
    },
    async obtener(id: number): Promise<Prioridad> {
      const response = await api.get(`/admin/prioridades/${id}`);
      return response.data.data;
    },
    async crear(data: CrearPrioridadData): Promise<Prioridad> {
      const response = await api.post('/admin/prioridades', data);
      return response.data.data;
    },
    async actualizar(id: number, data: Partial<CrearPrioridadData & { activo?: boolean }>): Promise<void> {
      await api.put(`/admin/prioridades/${id}`, data);
    },
    async eliminar(id: number): Promise<void> {
      await api.delete(`/admin/prioridades/${id}`);
    },
  },

  // Tipos
  tipos: {
    async listar(activo?: boolean, categoria?: string): Promise<Tipo[]> {
      const params: any = {};
      if (activo !== undefined) params.activo = activo;
      if (categoria) params.categoria = categoria;
      const response = await api.get('/admin/tipos', { params });
      return response.data.data;
    },
    async obtener(id: number): Promise<Tipo> {
      const response = await api.get(`/admin/tipos/${id}`);
      return response.data.data;
    },
    async crear(data: CrearTipoData): Promise<Tipo> {
      const response = await api.post('/admin/tipos', data);
      return response.data.data;
    },
    async actualizar(id: number, data: Partial<CrearTipoData & { activo?: boolean }>): Promise<void> {
      await api.put(`/admin/tipos/${id}`, data);
    },
    async eliminar(id: number): Promise<void> {
      await api.delete(`/admin/tipos/${id}`);
    },
  },
};

