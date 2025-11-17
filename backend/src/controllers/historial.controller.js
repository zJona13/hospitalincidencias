import { pool } from '../db.js';

// Obtener historial de una incidencia
export const obtenerHistorial = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Obtener ID de la incidencia
    const [incidencias] = await pool.execute(
      'SELECT id FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidenciaId = incidencias[0].id;
    
    // Obtener historial
    const [eventos] = await pool.execute(
      `SELECT h.id, h.tipo_evento, h.descripcion, h.estado_previo, h.estado_nuevo, h.fecha_evento,
              u.id as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email
       FROM historial_incidencias h
       INNER JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.incidencia_id = ?
       ORDER BY h.fecha_evento ASC`,
      [incidenciaId]
    );
    
    const eventosFormateados = eventos.map(evento => ({
      id: evento.id,
      tipo: evento.tipo_evento,
      descripcion: evento.descripcion,
      estadoPrevio: evento.estado_previo,
      estadoNuevo: evento.estado_nuevo,
      fecha: evento.fecha_evento,
      usuario: {
        id: evento.usuario_id,
        nombre: evento.usuario_nombre,
        email: evento.usuario_email
      }
    }));
    
    res.json({
      status: 'success',
      data: eventosFormateados
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener historial'
    });
  }
};

