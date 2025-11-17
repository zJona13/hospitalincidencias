import api from '@/lib/api';

export interface Comentario {
  id: number;
  texto: string;
  fecha: string;
  autor: {
    id: number;
    nombre: string;
    email: string;
  };
}

export const comentariosService = {
  async listar(codigo: string): Promise<Comentario[]> {
    const response = await api.get(`/incidencias/${codigo}/comentarios`);
    return response.data.data;
  },

  async agregar(codigo: string, texto: string): Promise<Comentario> {
    const response = await api.post(`/incidencias/${codigo}/comentarios`, { texto });
    return response.data.data;
  },
};

