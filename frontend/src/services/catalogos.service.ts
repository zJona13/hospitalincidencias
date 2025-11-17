import api from '@/lib/api';

export interface Area {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Tipo {
  id: number;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
}

export interface Subtipo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Prioridad {
  id: number;
  nivel: string;
  nombre: string;
  color: string;
  tiempo_respuesta_minutos: number;
  tiempo_resolucion_horas: number;
}

export interface UsuarioCatalogo {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  area?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
}

export const catalogosService = {
  async getAreas(): Promise<Area[]> {
    const response = await api.get('/catalogos/areas');
    return response.data.data;
  },

  async getServicios(areaId?: number): Promise<Servicio[]> {
    const params = areaId ? { area_id: areaId } : {};
    const response = await api.get('/catalogos/servicios', { params });
    return response.data.data;
  },

  async getTipos(): Promise<Tipo[]> {
    const response = await api.get('/catalogos/tipos');
    return response.data.data;
  },

  async getSubtipos(tipoId?: number): Promise<Subtipo[]> {
    const params = tipoId ? { tipo_id: tipoId } : {};
    const response = await api.get('/catalogos/subtipos', { params });
    return response.data.data;
  },

  async getPrioridades(): Promise<Prioridad[]> {
    const response = await api.get('/catalogos/prioridades');
    return response.data.data;
  },

  async getUsuarios(areaId?: number, rol?: string): Promise<UsuarioCatalogo[]> {
    const params: any = {};
    if (areaId) params.area_id = areaId;
    if (rol) params.rol = rol;
    const response = await api.get('/catalogos/usuarios', { params });
    return response.data.data;
  },
};

