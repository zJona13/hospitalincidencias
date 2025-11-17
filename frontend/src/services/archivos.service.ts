import api from '@/lib/api';

export interface Archivo {
  id: number;
  nombre: string;
  tipo: string;
  tamano: number;
  tamanoFormateado: string;
  fecha: string;
  subidoPor: {
    id: number;
    nombre: string;
  };
}

export const archivosService = {
  async listar(codigo: string): Promise<Archivo[]> {
    const response = await api.get(`/incidencias/${codigo}/archivos`);
    return response.data.data;
  },

  async subir(codigo: string, archivo: File): Promise<Archivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    const response = await api.post(`/incidencias/${codigo}/archivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async descargar(id: number, nombre: string): Promise<void> {
    const response = await api.get(`/incidencias/archivos/${id}/descargar`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombre);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async eliminar(codigo: string, id: number): Promise<void> {
    await api.delete(`/incidencias/archivos/${id}`);
  },
};

