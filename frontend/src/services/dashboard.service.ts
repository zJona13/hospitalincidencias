import api from '@/lib/api';

export interface Estadisticas {
  total: number;
  abiertas: number;
  enProgreso: number;
  resueltas: number;
  cerradas: number;
  tendencia: number;
}

export interface Tendencia {
  dia: string;
  fecha: string;
  cantidad: number;
}

export interface Distribucion {
  name: string;
  value: number;
  color?: string;
}

export const dashboardService = {
  async getEstadisticas(fechaInicio?: string, fechaFin?: string): Promise<Estadisticas> {
    const params: any = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    const response = await api.get('/dashboard/estadisticas', { params });
    return response.data.data;
  },

  async getTendencias(dias: number = 7): Promise<Tendencia[]> {
    const response = await api.get('/dashboard/tendencias', { params: { dias } });
    return response.data.data;
  },

  async getDistribuciones(tipo: 'tipo' | 'prioridad' | 'estado'): Promise<Distribucion[]> {
    const response = await api.get('/dashboard/distribuciones', { params: { tipo } });
    return response.data.data;
  },
};

