import { pool } from '../db.js';

// Listar notificaciones del usuario actual
export const listarNotificaciones = async (req, res) => {
  try {
    const { leida, tipo } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT n.id, n.tipo, n.titulo, n.mensaje, n.leida, n.fecha_creacion,
             i.id as incidencia_id, i.codigo as incidencia_codigo, i.titulo as incidencia_titulo
      FROM notificaciones n
      LEFT JOIN incidencias i ON n.incidencia_id = i.id
      WHERE n.usuario_id = ?
    `;
    
    const params = [userId];
    
    if (leida !== undefined) {
      query += ' AND n.leida = ?';
      params.push(leida === 'true' || leida === true);
    }
    
    if (tipo) {
      query += ' AND n.tipo = ?';
      params.push(tipo);
    }
    
    query += ' ORDER BY n.fecha_creacion DESC';
    
    const [notificaciones] = await pool.execute(query, params);
    
    const notificacionesFormateadas = notificaciones.map(n => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leida: n.leida,
      fecha: n.fecha_creacion,
      incidencia: n.incidencia_id ? {
        id: n.incidencia_id,
        codigo: n.incidencia_codigo,
        titulo: n.incidencia_titulo
      } : null
    }));
    
    res.json({
      status: 'success',
      data: notificacionesFormateadas
    });
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener notificaciones'
    });
  }
};

// Marcar notificación como leída
export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la notificación pertenece al usuario
    const [notificaciones] = await pool.execute(
      'SELECT id FROM notificaciones WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    
    if (notificaciones.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Notificación no encontrada'
      });
    }
    
    await pool.execute(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ?',
      [id]
    );
    
    res.json({
      status: 'success',
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al marcar notificación'
    });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasLeidas = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.execute(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE',
      [userId]
    );
    
    res.json({
      status: 'success',
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al marcar notificaciones'
    });
  }
};

// Obtener contador de notificaciones no leídas
export const contarNoLeidas = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await pool.execute(
      'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE',
      [userId]
    );
    
    res.json({
      status: 'success',
      data: {
        total: result[0].total
      }
    });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al contar notificaciones'
    });
  }
};

