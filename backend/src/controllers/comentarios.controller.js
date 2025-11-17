import { pool } from '../db.js';
import { registrarHistorial } from '../utils/historial.js';
import { crearNotificacion } from '../utils/notificaciones.js';

// Listar comentarios de una incidencia
export const listarComentarios = async (req, res) => {
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
    
    // Obtener comentarios
    const [comentarios] = await pool.execute(
      `SELECT c.id, c.texto, c.fecha_creacion,
              u.id as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email
       FROM comentarios c
       INNER JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.incidencia_id = ?
       ORDER BY c.fecha_creacion ASC`,
      [incidenciaId]
    );
    
    const comentariosFormateados = comentarios.map(com => ({
      id: com.id,
      texto: com.texto,
      fecha: com.fecha_creacion,
      autor: {
        id: com.usuario_id,
        nombre: com.usuario_nombre,
        email: com.usuario_email
      }
    }));
    
    res.json({
      status: 'success',
      data: comentariosFormateados
    });
  } catch (error) {
    console.error('Error al listar comentarios:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener comentarios'
    });
  }
};

// Agregar comentario
export const agregarComentario = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { texto } = req.body;
    const userId = req.user.id;
    
    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El texto del comentario es requerido'
      });
    }
    
    // Obtener ID de la incidencia
    const [incidencias] = await pool.execute(
      'SELECT id, responsable_id, reportado_por_id, titulo FROM incidencias WHERE codigo = ?',
      [codigo]
    );
    
    if (incidencias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Incidencia no encontrada'
      });
    }
    
    const incidencia = incidencias[0];
    const incidenciaId = incidencia.id;
    
    // Insertar comentario
    const [result] = await pool.execute(
      'INSERT INTO comentarios (incidencia_id, usuario_id, texto) VALUES (?, ?, ?)',
      [incidenciaId, userId, texto.trim()]
    );
    
    // Obtener información del usuario que comentó
    const [usuarios] = await pool.execute(
      'SELECT nombre FROM usuarios WHERE id = ?',
      [userId]
    );
    const nombreUsuario = usuarios[0]?.nombre || 'Usuario';
    
    // Registrar en historial
    await registrarHistorial(
      incidenciaId,
      'comentario',
      userId,
      `Comentario agregado: ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`
    );
    
    // Notificar a otros usuarios relacionados (responsable y reportador, excepto al que comentó)
    const usuariosNotificar = [];
    if (incidencia.responsable_id && incidencia.responsable_id !== userId) {
      usuariosNotificar.push(incidencia.responsable_id);
    }
    if (incidencia.reportado_por_id && incidencia.reportado_por_id !== userId) {
      usuariosNotificar.push(incidencia.reportado_por_id);
    }
    
    // Eliminar duplicados
    const usuariosUnicos = [...new Set(usuariosNotificar)];
    
    for (const usuarioId of usuariosUnicos) {
      await crearNotificacion(
        usuarioId,
        'comentario',
        'Nuevo comentario',
        `${nombreUsuario} comentó en la incidencia ${codigo}: ${incidencia.titulo}`,
        incidenciaId
      );
    }
    
    // Obtener el comentario creado
    const [comentarios] = await pool.execute(
      `SELECT c.id, c.texto, c.fecha_creacion,
              u.id as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email
       FROM comentarios c
       INNER JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Comentario agregado exitosamente',
      data: {
        id: comentarios[0].id,
        texto: comentarios[0].texto,
        fecha: comentarios[0].fecha_creacion,
        autor: {
          id: comentarios[0].usuario_id,
          nombre: comentarios[0].usuario_nombre,
          email: comentarios[0].usuario_email
        }
      }
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar comentario'
    });
  }
};

