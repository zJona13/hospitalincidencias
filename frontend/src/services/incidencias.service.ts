import api from '@/lib/api';

export interface Incidencia {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_progreso' | 'resuelta' | 'cerrada';
  area?: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
  servicio?: {
    id: number;
    nombre: string;
  } | null;
  tipo?: {
    id: number;
    nombre: string;
    categoria: string;
  } | null;
  subtipo?: {
    id: number;
    nombre: string;
  } | null;
  prioridad?: {
    id: number;
    nivel: string;
    nombre: string;
    color: string;
  } | null;
  reportadoPor?: {
    id: number;
    nombre: string;
    email: string;
  } | null;
  responsable?: {
    id: number;
    nombre: string;
    email: string;
  } | null;
  ubicacion?: {
    piso?: string;
    habitacion?: string;
    cama?: string;
    equipo?: string;
  };
  pacienteId?: string;
  fechas?: {
    creacion: string;
    actualizacion: string;
    vencimiento?: string;
    resolucion?: string;
    cierre?: string;
  };
  resolucion?: {
    id: number;
    solucion_aplicada: string;
    pasos_seguidos: string;
    recursos_utilizados?: string | null;
    tiempo_invertido_minutos: number;
    fecha_resolucion: string;
    resuelto_por: {
      id: number;
      nombre: string;
      email: string;
    };
    validado_por?: {
      id: number;
      nombre: string;
      email: string;
    } | null;
    fecha_validacion?: string | null;
  };
  sla?: string | null;
  tiempoTranscurrido?: string | null;
}

export interface CrearIncidenciaData {
  titulo: string;
  descripcion: string;
  area_id: number;
  servicio_id?: number;
  tipo_incidencia_id: number;
  subtipo_incidencia_id?: number;
  prioridad_id: number;
  responsable_id?: number;
  piso?: string;
  habitacion?: string;
  cama?: string;
  equipo?: string;
  paciente_id?: string;
}

export interface FiltrosIncidencias {
  area_id?: number;
  estado?: string;
  prioridad_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export const incidenciasService = {
  async listar(filtros?: FiltrosIncidencias): Promise<Incidencia[]> {
    const response = await api.get('/incidencias', { params: filtros });
    return response.data.data;
  },

  async obtener(codigo: string): Promise<Incidencia> {
    const response = await api.get(`/incidencias/${codigo}`);
    return response.data.data;
  },

  async crear(data: CrearIncidenciaData): Promise<{ id: number; codigo: string; titulo: string }> {
    const response = await api.post('/incidencias', data);
    return response.data.data;
  },

  async actualizar(codigo: string, data: Partial<CrearIncidenciaData>): Promise<void> {
    await api.put(`/incidencias/${codigo}`, data);
  },

  async cambiarEstado(codigo: string, estado: string): Promise<void> {
    await api.patch(`/incidencias/${codigo}/estado`, { estado });
  },

  async cambiarPrioridad(codigo: string, prioridad_id: number): Promise<void> {
    await api.patch(`/incidencias/${codigo}/prioridad`, { prioridad_id });
  },

  async reasignar(codigo: string, responsable_id: number): Promise<void> {
    await api.patch(`/incidencias/${codigo}/reasignar`, { responsable_id });
  },

  async misIncidencias(tipo: 'creadas' | 'asignadas' | 'todas' = 'todas', filtros?: Omit<FiltrosIncidencias, 'search'>): Promise<Incidencia[]> {
    const params = { tipo, ...filtros };
    const response = await api.get('/incidencias/mis-incidencias', { params });
    return response.data.data;
  },

  async resolver(codigo: string, datosResolucion: {
    solucion_aplicada: string;
    pasos_seguidos: string;
    recursos_utilizados?: string;
    tiempo_invertido_minutos: number;
  }): Promise<void> {
    await api.post(`/incidencias/${codigo}/resolver`, datosResolucion);
  },

  async obtenerRelacionadas(codigo: string): Promise<IncidenciaRelacionada[]> {
    const response = await api.get(`/incidencias/${codigo}/relacionadas`);
    return response.data.data;
  },

  async buscarRelacionadas(criterios: CriteriosRelacionadas): Promise<IncidenciaRelacionada[]> {
    const response = await api.get('/incidencias/relacionadas', { params: criterios });
    return response.data.data;
  },
};

export interface IncidenciaRelacionada {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_progreso' | 'resuelta' | 'cerrada';
  area?: {
    id: number;
    nombre: string;
  } | null;
  tipo?: {
    id: number;
    nombre: string;
  } | null;
  subtipo?: {
    id: number;
    nombre: string;
  } | null;
  prioridad?: {
    id: number;
    nombre: string;
    color: string;
  } | null;
  equipo?: string | null;
  fechaCreacion: string;
  reportadoPor?: {
    id: number;
    nombre: string;
    email: string;
  } | null;
  resolucion?: {
    solucion_aplicada: string;
    pasos_seguidos: string;
    tiempo_invertido_minutos: number;
    fecha_resolucion: string;
  } | null;
}

export interface CriteriosRelacionadas {
  tipo_incidencia_id?: number;
  subtipo_incidencia_id?: number;
  area_id?: number;
  equipo?: string;
  titulo?: string;
  descripcion?: string;
}

