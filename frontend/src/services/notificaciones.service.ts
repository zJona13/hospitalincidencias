import api from '@/lib/api';

export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  incidencia?: {
    id: number;
    codigo: string;
    titulo: string;
  } | null;
}

export const notificacionesService = {
  async listar(leida?: boolean, tipo?: string): Promise<Notificacion[]> {
    const params: any = {};
    if (leida !== undefined) params.leida = leida;
    if (tipo) params.tipo = tipo;
    const response = await api.get('/notificaciones', { params });
    return response.data.data;
  },

  async marcarLeida(id: number): Promise<void> {
    await api.patch(`/notificaciones/${id}/leer`);
  },

  async marcarTodasLeidas(): Promise<void> {
    await api.patch('/notificaciones/marcar-todas');
  },

  async contarNoLeidas(): Promise<number> {
    const response = await api.get('/notificaciones/contar');
    return response.data.data.total;
  },
};

