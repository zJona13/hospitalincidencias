import api from '@/lib/api';

export interface Prediccion {
  id?: number;
  tipo_incidencia_id?: number | null;
  tipo_incidencia_nombre?: string;
  area_id?: number | null;
  area_nombre?: string;
  periodo: 'mensual' | 'trimestral' | 'anual';
  fecha_periodo_inicio: string;
  fecha_periodo_fin: string;
  probabilidad: number;
  personas_afectadas_estimadas?: number | null;
  pacientes_afectados_estimados?: number | null;
  departamento_predicho?: string | null;
  metadatos?: any;
}

export interface ImpactoEstimado {
  predicciones: Prediccion[];
  resumen: {
    total_personas_afectadas_estimadas: number;
    total_pacientes_afectados_estimados: number;
    probabilidad_promedio: number;
    cantidad_predicciones: number;
  };
}

export interface ReporteAvanzado {
  estadisticas: {
    total: number;
    abiertas: number;
    en_progreso: number;
    resueltas: number;
    cerradas: number;
    tiempo_promedio_resolucion: number | null;
    personas_promedio: number | null;
    pacientes_promedio: number | null;
  };
  distribucion_tipo: Array<{
    id: number;
    nombre: string;
    cantidad: number;
  }>;
  distribucion_area: Array<{
    id: number;
    codigo: string;
    nombre: string;
    cantidad: number;
  }>;
  tendencias: Array<{
    mes: string;
    cantidad: number;
  }>;
}

export const analiticasService = {
  async obtenerPredicciones(periodo: 'mensual' | 'trimestral' | 'anual', fechaInicio?: string, recalcular?: boolean): Promise<Prediccion[]> {
    const params: any = { periodo };
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (recalcular) params.recalcular = 'true';
    const response = await api.get('/analiticas/predicciones', { params });
    return response.data.data;
  },

  async obtenerPrediccionDetalle(id: number): Promise<Prediccion> {
    const response = await api.get(`/analiticas/predicciones/${id}`);
    return response.data.data;
  },

  async obtenerImpactoEstimado(tipo_incidencia_id?: number, area_id?: number, periodo: 'mensual' | 'trimestral' | 'anual' = 'mensual'): Promise<ImpactoEstimado> {
    const params: any = { periodo };
    if (tipo_incidencia_id) params.tipo_incidencia_id = tipo_incidencia_id;
    if (area_id) params.area_id = area_id;
    const response = await api.get('/analiticas/impacto', { params });
    return response.data.data;
  },

  async obtenerReportesAvanzados(filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    area_id?: number;
    tipo_incidencia_id?: number;
  }): Promise<ReporteAvanzado> {
    const response = await api.get('/analiticas/reportes-avanzados', { params: filtros });
    return response.data.data;
  },

  async obtenerMetricasDirector(periodo: 'mensual' | 'trimestral' | 'anual' = 'mensual'): Promise<any> {
    const response = await api.get('/analiticas/metricas-director', { params: { periodo } });
    return response.data.data;
  },
};

