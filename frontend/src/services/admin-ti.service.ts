import api from '@/lib/api';
import { Incidencia } from './incidencias.service';

export interface IncidenciaPendiente extends Omit<Incidencia, 'responsable'> {
  reportadoPor: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface EstadisticasAsignaciones {
  resumen: {
    total_asignadas: number;
    pendientes: number;
    resueltas: number;
    en_progreso: number;
  };
  por_responsable: Array<{
    id: number;
    nombre: string;
    email: string;
    total_asignadas: number;
    abiertas: number;
    en_progreso: number;
    resueltas: number;
    cerradas: number;
    tiempo_promedio_resolucion: number | null;
    fuera_sla: number;
    carga_actual: number;
    tiempo_promedio_asignacion: number | null;
    tiempo_promedio_respuesta: number | null;
    tasa_resolucion: number;
    eficiencia: number | null;
  }>;
  distribucion_temporal: Array<{
    fecha: string;
    cantidad: number;
  }>;
  por_prioridad: Array<{
    nivel: string;
    nombre: string;
    color: string;
    total_asignadas: number;
    tiempo_promedio_asignacion: number | null;
    cumplimiento_sla: number;
    fuera_sla: number;
  }>;
  por_area: Array<{
    id: number;
    codigo: string;
    nombre: string;
    total_asignadas: number;
    sin_asignar: number;
  }>;
  top_eficientes: Array<{
    id: number;
    nombre: string;
    total_asignadas: number;
    resueltas_en_tiempo: number;
    eficiencia: number;
  }>;
  fuera_sla: Array<{
    id: number;
    nombre: string;
    total_fuera_sla: number;
  }>;
  tiempo_promedio_asignacion_general: number;
}

export const adminTiService = {
  async asignarIncidencia(codigo: string, responsableId: number): Promise<void> {
    await api.post(`/admin-ti/incidencias/${codigo}/asignar`, { responsable_id: responsableId });
  },

  async listarPendientes(limit?: number, offset?: number): Promise<{
    data: IncidenciaPendiente[];
    paginacion: {
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const response = await api.get('/admin-ti/incidencias/pendientes', { params });
    return response.data;
  },

  async reasignar(codigo: string, responsableId: number): Promise<void> {
    await api.patch(`/admin-ti/incidencias/${codigo}/reasignar`, { responsable_id: responsableId });
  },

  async obtenerEstadisticas(): Promise<EstadisticasAsignaciones> {
    const response = await api.get('/admin-ti/estadisticas');
    return response.data.data;
  },
};

