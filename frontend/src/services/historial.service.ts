import api from '@/lib/api';

export interface EventoHistorial {
  id: number;
  tipo: 'creacion' | 'asignacion' | 'estado' | 'comentario' | 'adjunto' | 'prioridad' | 'reasignacion';
  descripcion: string;
  estadoPrevio?: string;
  estadoNuevo?: string;
  fecha: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
}

export const historialService = {
  async obtener(codigo: string): Promise<EventoHistorial[]> {
    const response = await api.get(`/incidencias/${codigo}/historial`);
    return response.data.data;
  },
};

